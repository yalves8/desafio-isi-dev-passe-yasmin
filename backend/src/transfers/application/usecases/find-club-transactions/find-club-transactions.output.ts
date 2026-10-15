import { TransactionType } from '../../interfaces/repositories/transfer.repository.interface.js';

/**
 * Transação no formato da API (2.3.3).
 *
 * @export
 * @interface TransactionOutput
 */
export interface TransactionOutput {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: TransactionType;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

/**
 * Totais das transações filtradas (RN17).
 *
 * @export
 * @interface TransactionsSummaryOutput
 */
export interface TransactionsSummaryOutput {
  total_spent: number;
  total_received: number;
  total_fees: number;
  total_penalties: number;
  total_profit: number;
}

/**
 * Resposta do histórico: transações e `summary`.
 *
 * @export
 * @interface FindClubTransactionsOutput
 */
export interface FindClubTransactionsOutput {
  data: TransactionOutput[];
  summary: TransactionsSummaryOutput;
}
