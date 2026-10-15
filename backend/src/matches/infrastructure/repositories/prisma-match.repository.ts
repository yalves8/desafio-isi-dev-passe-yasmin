import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { Condition } from '../../../domain/market-value.js';
import { DuelAttribute, matchResult } from '../../../domain/match-engine.js';
import { Position } from '../../../domain/player-rating.js';
import { Formation } from '../../../lineups/domain/formation.js';
import { playerFromRow } from '../../../players/infrastructure/mappers/player.mapper.js';
import {
  IMatchRepository,
  MatchRecord,
  MatchTeamState,
  PlayMatchState,
  StoredMatch,
} from '../../application/interfaces/repositories/match.repository.interface.js';
import { PlayedScore } from '../../domain/standings.js';

type MatchRow = {
  id: number;
  mandante_id: number;
  visitante_id: number;
  gols_mandante: number;
  gols_visitante: number;
  formacao_mandante: string;
  formacao_visitante: string;
  jogada_em: Date;
  mandante: { nome: string };
  visitante: { nome: string };
  duelos?: {
    ordem: number;
    clube_atacante_id: number;
    atacante_id: number;
    defensor_id: number;
    nome_atacante: string;
    nome_defensor: string;
    posicao_atacante: string;
    posicao_defensor: string;
    condicao_atacante: string;
    condicao_defensor: string;
    atributo_ataque: string;
    atributo_defesa: string;
    valor_ataque: number;
    valor_defesa: number;
    gol: boolean;
  }[];
};

function toStored(row: MatchRow): StoredMatch {
  return {
    id: row.id,
    playedAt: row.jogada_em,
    home: {
      clubId: row.mandante_id,
      clubName: row.mandante.nome,
      formation: row.formacao_mandante as Formation,
      goals: row.gols_mandante,
    },
    away: {
      clubId: row.visitante_id,
      clubName: row.visitante.nome,
      formation: row.formacao_visitante as Formation,
      goals: row.gols_visitante,
    },
    // `result` não tem coluna no esquema do desafio: sai do placar gravado
    result: matchResult(row.gols_mandante, row.gols_visitante),
    duels: (row.duelos ?? []).map((d) => ({
      order: d.ordem,
      attackingClubId: d.clube_atacante_id,
      attacker: {
        playerId: d.atacante_id,
        playerName: d.nome_atacante,
        position: d.posicao_atacante as Position,
        condition: d.condicao_atacante as Condition,
        attribute: d.atributo_ataque as DuelAttribute,
        value: d.valor_ataque,
      },
      defender: {
        playerId: d.defensor_id,
        playerName: d.nome_defensor,
        position: d.posicao_defensor as Position,
        condition: d.condicao_defensor as Condition,
        attribute: d.atributo_defesa as DuelAttribute,
        value: d.valor_defesa,
      },
      goal: d.gol,
    })),
  };
}

const CLUB_NAMES = {
  mandante: { select: { nome: true } },
  visitante: { select: { nome: true } },
} as const;

/**
 * Implementação Prisma do repositório de partidas.
 *
 * A partida lê as escalações dos dois clubes com as linhas dos clubes travadas em modo
 * compartilhado (`FOR SHARE`, em ordem de id): uma troca de escalação ou uma venda, que travam
 * o clube para escrita, esperam a partida terminar, e a partida nunca lê uma escalação pela metade.
 *
 * @export
 * @class PrismaMatchRepository
 * @extends {IMatchRepository}
 */
@Injectable()
export class PrismaMatchRepository implements IMatchRepository {
  /**
   * Construtor da classe `PrismaMatchRepository`.
   *
   * @param {PrismaService} prisma - Conexão Prisma com o PostgreSQL.
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lê os clubes e as escalações, joga e grava a partida com os 6 duelos (RN20, passo 7).
   *
   * @param {number} homeClubId - Mandante.
   * @param {number} awayClubId - Visitante.
   * @param {(state: PlayMatchState) => MatchRecord} play - Conferências e motor.
   * @returns {Promise<StoredMatch>} Partida gravada.
   */
  async play(
    homeClubId: number,
    awayClubId: number,
    play: (state: PlayMatchState) => MatchRecord,
  ): Promise<StoredMatch> {
    return this.prisma.$transaction(async (tx) => {
      const ids = [homeClubId, awayClubId].sort((a, b) => a - b);
      await tx.$queryRaw`SELECT id FROM clubes WHERE id = ANY(${ids}::int[]) ORDER BY id FOR SHARE`;

      const loadTeam = async (
        clubId: number,
      ): Promise<MatchTeamState | null> => {
        const club = await tx.clube.findUnique({
          where: { id: clubId },
          include: {
            escalacoes: {
              where: { jogador: { excluido_em: null } },
              include: { jogador: true },
            },
          },
        });
        if (!club) return null;
        return {
          id: club.id,
          name: club.nome,
          formation: (club.formacao as Formation | null) ?? null,
          starters: club.escalacoes.map((row) => playerFromRow(row.jogador)),
        };
      };

      const record = play({
        home: await loadTeam(homeClubId),
        away: await loadTeam(awayClubId),
      });

      const created = await tx.partida.create({
        data: {
          mandante_id: record.home.clubId,
          visitante_id: record.away.clubId,
          gols_mandante: record.home.goals,
          gols_visitante: record.away.goals,
          formacao_mandante: record.home.formation,
          formacao_visitante: record.away.formation,
          jogada_em: record.playedAt,
          duelos: {
            create: record.duels.map((d) => ({
              ordem: d.order,
              clube_atacante_id: d.attackingClubId,
              atacante_id: d.attacker.playerId,
              defensor_id: d.defender.playerId,
              nome_atacante: d.attacker.playerName,
              nome_defensor: d.defender.playerName,
              posicao_atacante: d.attacker.position,
              posicao_defensor: d.defender.position,
              condicao_atacante: d.attacker.condition,
              condicao_defensor: d.defender.condition,
              atributo_ataque: d.attacker.attribute,
              atributo_defesa: d.defender.attribute,
              valor_ataque: d.attacker.value,
              valor_defesa: d.defender.value,
              gol: d.goal,
            })),
          },
        },
      });
      return { ...record, id: created.id };
    });
  }

  /**
   * Partidas da mais recente para a mais antiga, sem duelos (RN21, item 1).
   *
   * @param {number} [clubId] - Só as partidas do clube, como mandante ou visitante.
   * @returns {Promise<StoredMatch[]>} Partidas.
   */
  async findMany(clubId?: number): Promise<StoredMatch[]> {
    const rows = await this.prisma.partida.findMany({
      where:
        clubId === undefined
          ? {}
          : { OR: [{ mandante_id: clubId }, { visitante_id: clubId }] },
      include: CLUB_NAMES,
      orderBy: [{ jogada_em: 'desc' }, { id: 'desc' }],
    });
    return rows.map(toStored);
  }

  /**
   * Partida com os 6 duelos na ordem da RN20.
   *
   * @param {number} id - Partida da URL.
   * @returns {Promise<StoredMatch | null>} null se não existe.
   */
  async findById(id: number): Promise<StoredMatch | null> {
    const row = await this.prisma.partida.findUnique({
      where: { id },
      include: { ...CLUB_NAMES, duelos: { orderBy: { ordem: 'asc' } } },
    });
    return row ? toStored(row) : null;
  }

  /**
   * Indica se o clube existe.
   *
   * @param {number} clubId - Clube do filtro.
   * @returns {Promise<boolean>} true se existir.
   */
  async clubExists(clubId: number): Promise<boolean> {
    return (await this.prisma.clube.count({ where: { id: clubId } })) > 0;
  }

  /**
   * Todos os clubes e os placares, para a classificação calculada na hora (RN21).
   *
   * @returns {Promise<{ clubs: { id: number; name: string }[]; scores: PlayedScore[] }>}
   */
  async findStandingsData(): Promise<{
    clubs: { id: number; name: string }[];
    scores: PlayedScore[];
  }> {
    const [clubs, matches] = await Promise.all([
      this.prisma.clube.findMany({ select: { id: true, nome: true } }),
      this.prisma.partida.findMany({
        select: {
          mandante_id: true,
          visitante_id: true,
          gols_mandante: true,
          gols_visitante: true,
        },
      }),
    ]);
    return {
      clubs: clubs.map((c) => ({ id: c.id, name: c.nome })),
      scores: matches.map((m) => ({
        homeClubId: m.mandante_id,
        awayClubId: m.visitante_id,
        homeGoals: m.gols_mandante,
        awayGoals: m.gols_visitante,
      })),
    };
  }
}
