import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { Cents, toCents } from '../../../domain/money.js';
import { playerFromRow } from '../../../players/infrastructure/mappers/player.mapper.js';
import {
  ITransferRepository,
  PurchaseRecord,
  PurchaseState,
  SaleRecord,
  SaleState,
  TransactionFilter,
  TransactionRecord,
  TransactionType,
} from '../../application/interfaces/repositories/transfer.repository.interface.js';

/** Centavos no formato decimal das colunas (ex.: -3885 → "-38.85"), sem ponto flutuante */
function toDecimal(cents: Cents): string {
  return (cents / 100).toFixed(2);
}

/**
 * Implementação Prisma do repositório de compra e venda.
 *
 * Cada operação roda numa transação interativa e trava as linhas envolvidas com
 * `SELECT ... FOR UPDATE`, sempre na mesma ordem (jogador, depois clube), para que
 * operações simultâneas sejam feitas uma depois da outra e sem deadlock.
 *
 * @export
 * @class PrismaTransferRepository
 * @extends {ITransferRepository}
 */
@Injectable()
export class PrismaTransferRepository implements ITransferRepository {
  /**
   * Construtor da classe `PrismaTransferRepository`.
   *
   * @param {PrismaService} prisma - Conexão Prisma com o PostgreSQL.
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Trava jogador e clube, lê o estado, aplica a decisão e grava a compra (RN12).
   *
   * @param {number} playerId - Jogador da URL.
   * @param {number} clubId - Clube comprador.
   * @param {(state: PurchaseState) => PurchaseRecord} decide - Regras da compra.
   * @returns {Promise<{ record: PurchaseRecord; transactionId: number }>} O que foi gravado.
   */
  async purchase(
    playerId: number,
    clubId: number,
    decide: (state: PurchaseState) => PurchaseRecord,
  ): Promise<{ record: PurchaseRecord; transactionId: number }> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM jogadores WHERE id = ${playerId} FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM clubes WHERE id = ${clubId} FOR UPDATE`;

      const [playerRow, clubRow, squadSize, sales] = await Promise.all([
        tx.jogador.findFirst({ where: { id: playerId, excluido_em: null } }),
        tx.clube.findUnique({ where: { id: clubId } }),
        tx.jogador.count({ where: { clube_id: clubId, excluido_em: null } }),
        tx.transacao.count({
          where: { clube_id: clubId, jogador_id: playerId, tipo: 'VENDA' },
        }),
      ]);

      const record = decide({
        player: playerRow ? playerFromRow(playerRow) : null,
        club: clubRow
          ? { id: clubRow.id, name: clubRow.nome, cash: toCents(clubRow.caixa) }
          : null,
        squadSize,
        soldBefore: sales > 0,
      });

      await tx.clube.update({
        where: { id: record.clubId },
        data: { caixa: toDecimal(record.newCash) },
      });
      await tx.jogador.update({
        where: { id: record.playerId },
        data: { clube_id: record.clubId },
      });
      await tx.contrato.create({
        data: {
          jogador_id: record.playerId,
          clube_id: record.clubId,
          valor_compra: toDecimal(record.value),
          fidelidade_ate: record.loyaltyUntil,
          situacao: 'ATIVO',
          iniciado_em: record.now,
        },
      });
      const transaction = await tx.transacao.create({
        data: {
          clube_id: record.clubId,
          jogador_id: record.playerId,
          nome_jogador: record.playerName,
          tipo: 'COMPRA',
          valor: toDecimal(record.value),
          taxa: toDecimal(record.fee),
          multa: toDecimal(0),
          lucro: null,
          variacao_caixa: toDecimal(-(record.value + record.fee)),
          criado_em: record.now,
        },
      });

      return { record, transactionId: transaction.id };
    });
  }

  /**
   * Trava o jogador e o clube dele, lê o contrato ativo, aplica a decisão e grava a venda:
   * caixa, jogador livre, contrato encerrado, saída da escalação e transação (RN15, RN16, RN19).
   *
   * @param {number} playerId - Jogador da URL.
   * @param {(state: SaleState) => SaleRecord} decide - Regras da venda.
   * @returns {Promise<{ record: SaleRecord; transactionId: number }>} O que foi gravado.
   */
  async sale(
    playerId: number,
    decide: (state: SaleState) => SaleRecord,
  ): Promise<{ record: SaleRecord; transactionId: number }> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM jogadores WHERE id = ${playerId} FOR UPDATE`;
      const playerRow = await tx.jogador.findFirst({
        where: { id: playerId, excluido_em: null },
      });

      // O clube só é conhecido depois de ler o jogador: a ordem de trava continua jogador → clube
      const clubId = playerRow?.clube_id ?? null;
      if (clubId !== null) {
        await tx.$queryRaw`SELECT id FROM clubes WHERE id = ${clubId} FOR UPDATE`;
      }
      const [clubRow, contractRow] =
        clubId === null
          ? [null, null]
          : await Promise.all([
              tx.clube.findUnique({ where: { id: clubId } }),
              tx.contrato.findFirst({
                where: {
                  jogador_id: playerId,
                  clube_id: clubId,
                  situacao: 'ATIVO',
                },
              }),
            ]);

      const record = decide({
        player: playerRow ? playerFromRow(playerRow) : null,
        club: clubRow
          ? { id: clubRow.id, name: clubRow.nome, cash: toCents(clubRow.caixa) }
          : null,
        contract: contractRow
          ? {
              id: contractRow.id,
              purchaseValue: toCents(contractRow.valor_compra),
              loyaltyUntil: contractRow.fidelidade_ate,
            }
          : null,
      });

      await tx.clube.update({
        where: { id: record.clubId },
        data: { caixa: toDecimal(record.newCash) },
      });
      await tx.jogador.update({
        where: { id: record.playerId },
        data: { clube_id: null },
      });
      await tx.contrato.update({
        where: { id: record.contractId },
        data: { situacao: record.contractStatus, encerrado_em: record.now },
      });
      // Titular vendido sai da escalação; a formação do clube continua gravada (RN19)
      await tx.escalacao.deleteMany({ where: { jogador_id: record.playerId } });
      const transaction = await tx.transacao.create({
        data: {
          clube_id: record.clubId,
          jogador_id: record.playerId,
          nome_jogador: record.playerName,
          tipo: 'VENDA',
          valor: toDecimal(record.value),
          taxa: toDecimal(record.commission),
          multa: toDecimal(record.penalty),
          lucro: toDecimal(record.profit),
          variacao_caixa: toDecimal(record.credit),
          criado_em: record.now,
        },
      });

      return { record, transactionId: transaction.id };
    });
  }

  /**
   * Indica se o clube existe.
   *
   * @param {number} clubId - Clube da URL.
   * @returns {Promise<boolean>} true se existir.
   */
  async clubExists(clubId: number): Promise<boolean> {
    return (await this.prisma.clube.count({ where: { id: clubId } })) > 0;
  }

  /**
   * Indica se o jogador existe e não foi excluído (RN09).
   *
   * @param {number} playerId - Jogador do filtro.
   * @returns {Promise<boolean>} true se existir e estiver ativo.
   */
  async activePlayerExists(playerId: number): Promise<boolean> {
    const count = await this.prisma.jogador.count({
      where: { id: playerId, excluido_em: null },
    });
    return count > 0;
  }

  /**
   * Transações do clube com os filtros, da mais recente para a mais antiga e, no empate,
   * por id decrescente (RN17). Os valores são os gravados no momento da operação.
   *
   * @param {number} clubId - Clube da URL.
   * @param {TransactionFilter} filter - Tipos e jogador.
   * @returns {Promise<TransactionRecord[]>} Transações gravadas.
   */
  async findClubTransactions(
    clubId: number,
    { types, playerId }: TransactionFilter,
  ): Promise<TransactionRecord[]> {
    const rows = await this.prisma.transacao.findMany({
      where: {
        clube_id: clubId,
        ...(types ? { tipo: { in: types } } : {}),
        ...(playerId !== undefined ? { jogador_id: playerId } : {}),
      },
      orderBy: [{ criado_em: 'desc' }, { id: 'desc' }],
    });
    return rows.map((row) => ({
      id: row.id,
      clubId: row.clube_id,
      playerId: row.jogador_id,
      playerName: row.nome_jogador,
      type: row.tipo as TransactionType,
      value: toCents(row.valor),
      fee: toCents(row.taxa),
      penalty: toCents(row.multa),
      profit: row.lucro === null ? null : toCents(row.lucro),
      cashChange: toCents(row.variacao_caixa),
      createdAt: row.criado_em,
    }));
  }
}
