import { TransactionsSummary } from '../../../domain/transactions-summary.js';
import { TransactionRecord } from '../../interfaces/repositories/transfer.repository.interface.js';

/**
 * Histórico do clube com os filtros, sem formato de transporte: as transações como foram
 * gravadas e os totais (RN17), em centavos.
 *
 * @export
 * @interface FindClubTransactionsOutput
 */
export interface FindClubTransactionsOutput {
  transactions: TransactionRecord[];
  summary: TransactionsSummary;
}
