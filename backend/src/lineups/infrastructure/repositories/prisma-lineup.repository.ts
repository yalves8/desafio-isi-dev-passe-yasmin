import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { playerFromRow } from '../../../players/infrastructure/mappers/player.mapper.js';
import {
  ILineupRepository,
  LineupChangeState,
  StoredLineup,
} from '../../application/interfaces/repositories/lineup.repository.interface.js';
import { Formation } from '../../domain/formation.js';
import { readClubLineup } from '../queries/club-lineup.query.js';

/**
 * Implementação Prisma do repositório de escalação.
 *
 * A formação fica em `clubes.formacao` e os titulares em `escalacoes`. A troca trava os
 * jogadores pedidos (em ordem crescente de id) e depois o clube, a mesma ordem jogador → clube
 * da compra e da venda: uma venda ou a troca para DOENTE ao mesmo tempo não deixam titular inválido.
 *
 * @export
 * @class PrismaLineupRepository
 * @extends {ILineupRepository}
 */
@Injectable()
export class PrismaLineupRepository implements ILineupRepository {
  /**
   * Construtor da classe `PrismaLineupRepository`.
   *
   * @param {PrismaService} prisma - Conexão Prisma com o PostgreSQL.
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Escalação gravada do clube, com os titulares ativos.
   *
   * @param {number} clubId - Clube da URL.
   * @returns {Promise<StoredLineup | null>} null se o clube não existe.
   */
  async findByClub(clubId: number): Promise<StoredLineup | null> {
    const lineup = await readClubLineup(this.prisma, clubId);
    if (!lineup) return null;
    return {
      clubId: lineup.id,
      clubName: lineup.name,
      formation: lineup.formation,
      starters: lineup.starters,
    };
  }

  /**
   * Trava jogadores e clube, valida e substitui a escalação inteira (RN19, item 3).
   *
   * @param {number} clubId - Clube da URL.
   * @param {Formation} formation - Nova formação.
   * @param {number[]} playerIds - Os 5 titulares.
   * @param {(state: LineupChangeState) => void} validate - Regras da RN19.
   * @returns {Promise<void>}
   */
  async replace(
    clubId: number,
    formation: Formation,
    playerIds: number[],
    validate: (state: LineupChangeState) => void,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const sortedIds = [...playerIds].sort((a, b) => a - b);
      await tx.$queryRaw`SELECT id FROM jogadores WHERE id = ANY(${sortedIds}::int[]) ORDER BY id FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM clubes WHERE id = ${clubId} FOR UPDATE`;

      const [club, rows] = await Promise.all([
        tx.clube.findUnique({ where: { id: clubId } }),
        tx.jogador.findMany({
          where: { id: { in: playerIds }, excluido_em: null },
        }),
      ]);
      const byId = new Map(rows.map((row) => [row.id, playerFromRow(row)]));

      validate({
        club: club ? { id: club.id, name: club.nome } : null,
        players: playerIds.map((id) => ({ id, player: byId.get(id) ?? null })),
      });

      await tx.clube.update({
        where: { id: clubId },
        data: { formacao: formation },
      });
      await tx.escalacao.deleteMany({ where: { clube_id: clubId } });
      await tx.escalacao.createMany({
        data: playerIds.map((id) => ({ clube_id: clubId, jogador_id: id })),
      });
    });
  }
}
