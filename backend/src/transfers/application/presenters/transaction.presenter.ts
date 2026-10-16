import { formatBrasiliaDateTime } from '../../../common/utils/date.js';
import { fromCents } from '../../../domain/money.js';
import { TransactionsSummary } from '../../domain/transactions-summary.js';
import {
  PurchaseRecord,
  SaleRecord,
  TransactionRecord,
} from '../interfaces/repositories/transfer.repository.interface.js';
import { BuyPlayerOutput } from '../usecases/buy-player/buy-player.output.js';
import {
  TransactionOutput,
  TransactionsSummaryOutput,
} from '../usecases/find-club-transactions/find-club-transactions.output.js';
import { SellPlayerOutput } from '../usecases/sell-player/sell-player.output.js';

/** Transação gravada no formato da API (2.3.3), com os valores e o nome do momento (RN17) */
export function toTransactionOutput(t: TransactionRecord): TransactionOutput {
  return {
    id: t.id,
    club_id: t.clubId,
    player_id: t.playerId,
    player_name: t.playerName,
    type: t.type,
    value: fromCents(t.value),
    fee: fromCents(t.fee),
    penalty: fromCents(t.penalty),
    profit: t.profit === null ? null : fromCents(t.profit),
    cash_change: fromCents(t.cashChange),
    created_at: formatBrasiliaDateTime(t.createdAt),
  };
}

/** Totais do histórico (RN17) em moedas */
export function toSummaryOutput(
  summary: TransactionsSummary,
): TransactionsSummaryOutput {
  return {
    total_spent: fromCents(summary.spent),
    total_received: fromCents(summary.received),
    total_fees: fromCents(summary.fees),
    total_penalties: fromCents(summary.penalties),
    total_profit: fromCents(summary.profit),
  };
}

/** Resposta da compra (2.3.1): a transação COMPRA, o contrato criado e o novo caixa */
export function toPurchaseOutput(
  transactionId: number,
  record: PurchaseRecord,
): BuyPlayerOutput {
  return {
    id: transactionId,
    club_id: record.clubId,
    player_id: record.playerId,
    player_name: record.playerName,
    type: 'COMPRA',
    value: fromCents(record.value),
    fee: fromCents(record.fee),
    penalty: 0,
    profit: null,
    cash_change: fromCents(-(record.value + record.fee)),
    created_at: formatBrasiliaDateTime(record.now),
    contract: {
      purchase_value: fromCents(record.value),
      loyalty_until: formatBrasiliaDateTime(record.loyaltyUntil),
      status: 'ATIVO',
    },
    club_cash: fromCents(record.newCash),
  };
}

/** Resposta da venda (2.3.2): a transação VENDA, o acerto (RN15 e RN16) e o novo caixa */
export function toSaleOutput(
  transactionId: number,
  record: SaleRecord,
): SellPlayerOutput {
  return {
    id: transactionId,
    club_id: record.clubId,
    player_id: record.playerId,
    player_name: record.playerName,
    type: 'VENDA',
    value: fromCents(record.value),
    fee: fromCents(record.commission),
    penalty: fromCents(record.penalty),
    profit: fromCents(record.profit),
    cash_change: fromCents(record.credit),
    created_at: formatBrasiliaDateTime(record.now),
    purchase_value: fromCents(record.purchaseValue),
    remaining_days: record.remainingDays,
    penalty_rate: record.penaltyRate,
    contract_status: record.contractStatus,
    club_cash: fromCents(record.newCash),
  };
}
