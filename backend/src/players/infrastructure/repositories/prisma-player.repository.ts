import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CONDITION_RULES } from '../../../domain/condition.js';
import {
  IPlayerRepository,
  PlayerFilterCriteria,
} from '../../application/interfaces/repositories/player.repository.interface.js';
import {
  NewPlayer,
  PlayerEntity,
} from '../../domain/entities/player.entity.js';
import { playerFromRow } from '../mappers/player.mapper.js';

/**
 * Implementação concreta de persistência do IPlayerRepository utilizando Prisma ORM.
 *
 * Mapeia entre a tabela `jogadores` do PostgreSQL e as entidades de domínio `PlayerEntity`.
 *
 * @export
 * @class PrismaPlayerRepository
 * @extends {IPlayerRepository}
 */
@Injectable()
export class PrismaPlayerRepository implements IPlayerRepository {
  /**
   * Construtor da classe `PrismaPlayerRepository`.
   *
   * @param {PrismaService} prisma - Conexão Prisma com o PostgreSQL.
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca um atleta ativo pelo ID.
   *
   * @param {number} id - Identificador do atleta.
   * @returns {Promise<PlayerEntity | null>} Entidade de domínio ou null se inexistente/excluído.
   */
  async findById(id: number): Promise<PlayerEntity | null> {
    const raw = await this.prisma.jogador.findFirst({
      where: { id, excluido_em: null },
    });
    if (!raw) return null;
    return playerFromRow(raw);
  }

  /**
   * Grava um atleta novo na base de dados.
   *
   * @param {NewPlayer} player - Jogador novo, com o valor base calculado no cadastro (RN06).
   * @returns {Promise<PlayerEntity>} Entidade persistida.
   */
  async create(player: NewPlayer): Promise<PlayerEntity> {
    const created = await this.prisma.jogador.create({
      data: {
        nome: player.name,
        posicao: player.position,
        agilidade: player.agility,
        idade: player.age,
        valor_base: player.baseValue.toDecimalString(),
        condicao: player.condition,
        clube_id: player.clubId,
        velocidade: player.attributes.pace,
        finalizacao: player.attributes.shooting,
        passe: player.attributes.passing,
        drible: player.attributes.dribbling,
        defesa: player.attributes.defending,
        fisico: player.attributes.physical,
        potencial: player.potential,
      },
    });

    return playerFromRow(created);
  }

  /**
   * Atualiza dados cadastrais do atleta.
   *
   * @param {PlayerEntity} player - Entidade com dados a atualizar.
   * @returns {Promise<PlayerEntity>} Entidade atualizada.
   */
  async update(player: PlayerEntity): Promise<PlayerEntity> {
    const updated = await this.prisma.jogador.update({
      where: { id: player.id },
      data: {
        nome: player.getName(),
        posicao: player.getPosition(),
        agilidade: player.getAgility(),
        idade: player.getAge(),
      },
    });

    return playerFromRow(updated);
  }

  /**
   * Atualiza a condição física do jogador.
   * Se for alterado para 'DOENTE', remove os registros de titularidade em escalações (RN19).
   *
   * @param {PlayerEntity} player - Entidade com a nova condição.
   * @returns {Promise<PlayerEntity>} Entidade atualizada.
   */
  async updateCondition(player: PlayerEntity): Promise<PlayerEntity> {
    const newCondition = player.getCondition();

    if (CONDITION_RULES[newCondition].leavesLineup) {
      // Atualiza o jogador antes de tirá-lo da escalação: o UPDATE espera a trava de uma troca
      // de escalação em andamento, e a remoção já enxerga o titular que ela gravou
      const updated = await this.prisma.$transaction(async (tx) => {
        const row = await tx.jogador.update({
          where: { id: player.id },
          data: { condicao: newCondition },
        });
        await tx.escalacao.deleteMany({
          where: { jogador_id: player.id },
        });
        return row;
      });
      return playerFromRow(updated);
    }

    const updated = await this.prisma.jogador.update({
      where: { id: player.id },
      data: { condicao: newCondition },
    });

    return playerFromRow(updated);
  }

  /**
   * Executa a exclusão lógica do jogador marcando a data atual em excluido_em (RN09).
   *
   * @param {number} id - Identificador do atleta.
   * @returns {Promise<void>}
   */
  async softDelete(id: number): Promise<void> {
    await this.prisma.jogador.update({
      where: { id },
      data: { excluido_em: new Date() },
    });
  }

  /**
   * Consulta atletas ativos filtrando por critérios de banco de dados.
   *
   * @param {PlayerFilterCriteria} filter - Critérios de filtro.
   * @returns {Promise<PlayerEntity[]>} Lista de atletas ativos.
   */
  async findMany(filter: PlayerFilterCriteria): Promise<PlayerEntity[]> {
    const where: {
      excluido_em: null;
      clube_id?: number | null | { not: null };
      posicao?: string;
      condicao?: string;
      idade?: { gte?: number; lte?: number };
    } = {
      excluido_em: null,
    };

    if (filter.clubId !== undefined) {
      where.clube_id = filter.clubId;
    } else if (filter.free === true) {
      where.clube_id = null;
    } else if (filter.free === false) {
      where.clube_id = { not: null };
    }

    if (filter.position) {
      where.posicao = filter.position;
    }

    if (filter.condition) {
      where.condicao = filter.condition;
    }

    if (filter.minAge !== undefined || filter.maxAge !== undefined) {
      where.idade = {};
      if (filter.minAge !== undefined) where.idade.gte = filter.minAge;
      if (filter.maxAge !== undefined) where.idade.lte = filter.maxAge;
    }

    const rawList = await this.prisma.jogador.findMany({ where });
    return rawList.map((r) => playerFromRow(r));
  }

  /**
   * Verifica se um determinado clube existe na tabela de clubes.
   *
   * @param {number} clubId - Identificador do clube.
   * @returns {Promise<boolean>} True se existir, false caso contrário.
   */
  async checkClubExists(clubId: number): Promise<boolean> {
    const club = await this.prisma.clube.findUnique({
      where: { id: clubId },
    });
    return club !== null;
  }
}
