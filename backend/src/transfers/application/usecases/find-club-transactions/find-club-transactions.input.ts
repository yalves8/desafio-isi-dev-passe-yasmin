import { TransactionType } from '../../interfaces/repositories/transfer.repository.interface.js';

/**
 * Dados de entrada do histórico do clube (GET /clubs/{id}/transactions e /export).
 *
 * @export
 * @interface FindClubTransactionsInput
 */
export interface FindClubTransactionsInput {
  /** Clube da URL */
  clubId: number;
  /** Filtro por tipo; ausente = compras e vendas */
  types?: TransactionType[];
  /** Filtro por jogador */
  playerId?: number;
}
