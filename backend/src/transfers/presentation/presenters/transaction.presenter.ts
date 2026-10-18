import { formatBrasiliaDateTime } from '../../../common/utils/date.js';
import { fromCents } from '../../../domain/money.js';
import { TransactionsSummary } from '../../domain/transactions-summary.js';
import { TransactionRecord } from '../../application/interfaces/repositories/transfer.repository.interface.js';
import { BuyPlayerOutput } from '../../application/usecases/buy-player/buy-player.output.js';
import { FindClubTransactionsOutput } from '../../application/usecases/find-club-transactions/find-club-transactions.output.js';
import { SellPlayerOutput } from '../../application/usecases/sell-player/sell-player.output.js';
import {
  PurchaseResponse,
  SaleResponse,
  TransactionResponse,
  TransactionsPageResponse,
  TransactionsSummaryResponse,
} from '../responses/transaction.response.js';

/** Transação gravada no formato da API (2.3.3), com os valores e o nome do momento (RN17) */
function toTransactionResponse(t: TransactionRecord): TransactionResponse {
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
function toSummaryResponse(
  summary: TransactionsSummary,
): TransactionsSummaryResponse {
  return {
    total_spent: fromCents(summary.spent),
    total_received: fromCents(summary.received),
    total_fees: fromCents(summary.fees),
    total_penalties: fromCents(summary.penalties),
    total_profit: fromCents(summary.profit),
  };
}

/** Resposta da compra (2.3.1): a transação COMPRA, o contrato criado e o novo caixa */
export function toPurchaseResponse(record: BuyPlayerOutput): PurchaseResponse {
  return {
    ...toTransactionResponse({
      id: record.transactionId,
      clubId: record.clubId,
      playerId: record.playerId,
      playerName: record.playerName,
      type: 'COMPRA',
      value: record.value,
      fee: record.fee,
      penalty: 0,
      profit: null,
      cashChange: record.cashChange,
      createdAt: record.now,
    }),
    type: 'COMPRA',
    profit: null,
    contract: {
      purchase_value: fromCents(record.value),
      loyalty_until: formatBrasiliaDateTime(record.loyaltyUntil),
      status: 'ATIVO',
    },
    club_cash: fromCents(record.newCash),
  };
}

/** Resposta da venda (2.3.2): a transação VENDA, o acerto (RN15 e RN16) e o novo caixa */
export function toSaleResponse(record: SellPlayerOutput): SaleResponse {
  return {
    ...toTransactionResponse({
      id: record.transactionId,
      clubId: record.clubId,
      playerId: record.playerId,
      playerName: record.playerName,
      type: 'VENDA',
      value: record.value,
      fee: record.commission,
      penalty: record.penalty,
      profit: record.profit,
      cashChange: record.credit,
      createdAt: record.now,
    }),
    type: 'VENDA',
    profit: fromCents(record.profit),
    purchase_value: fromCents(record.purchaseValue),
    remaining_days: record.remainingDays,
    penalty_rate: record.penaltyRate,
    contract_status: record.contractStatus,
    club_cash: fromCents(record.newCash),
  };
}

/** Histórico do clube no formato da API (2.3.3): `data` e `summary` */
export function toTransactionsPageResponse(
  history: FindClubTransactionsOutput,
): TransactionsPageResponse {
  return {
    data: history.transactions.map(toTransactionResponse),
    summary: toSummaryResponse(history.summary),
  };
}
