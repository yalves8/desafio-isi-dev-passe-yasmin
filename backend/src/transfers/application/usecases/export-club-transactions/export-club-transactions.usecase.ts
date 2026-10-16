import {
  ITransferRepository,
  TransactionRecord,
} from '../../interfaces/repositories/transfer.repository.interface.js';
import { loadClubTransactions } from '../../services/load-club-transactions.js';
import { FindClubTransactionsInput } from '../find-club-transactions/find-club-transactions.input.js';

/**
 * Caso de uso da exportação do histórico (RN18): as mesmas transações, filtros e validações
 * do histórico, na mesma ordem. O arquivo CSV é montado pela apresentação
 * (`toTransactionsCsv`).
 *
 * @export
 * @class ExportClubTransactionsUseCase
 */
export class ExportClubTransactionsUseCase {
  /**
   * Construtor do `ExportClubTransactionsUseCase`.
   *
   * @param {ITransferRepository} transferRepository - Repositório de compra e venda.
   */
  constructor(private readonly transferRepository: ITransferRepository) {}

  /**
   * Busca as transações a exportar.
   *
   * @param {FindClubTransactionsInput} input - Clube e filtros.
   * @returns {Promise<TransactionRecord[]>} Transações da mais recente para a mais antiga.
   */
  async execute(
    input: FindClubTransactionsInput,
  ): Promise<TransactionRecord[]> {
    return loadClubTransactions(this.transferRepository, input);
  }
}
