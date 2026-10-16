import { ITransferRepository } from '../../interfaces/repositories/transfer.repository.interface.js';
import { toTransactionsCsv } from '../../presenters/transactions-csv.presenter.js';
import { loadClubTransactions } from '../../services/load-club-transactions.js';
import { FindClubTransactionsInput } from '../find-club-transactions/find-club-transactions.input.js';

/**
 * Caso de uso da exportação do histórico em CSV (RN18).
 *
 * Regras aplicadas:
 * 1. Mesmos filtros e mesmas validações do histórico, na mesma ordem.
 * 2. Cabeçalho fixo; separador `;`; data no formato das respostas (RN01).
 * 3. Valores com 2 casas e vírgula decimal, negativo com `-`; lucro vazio quando nulo.
 * 4. Cada linha termina em `\n`, inclusive a última; sem transações, só o cabeçalho.
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
   * Gera o CSV do histórico.
   *
   * @param {FindClubTransactionsInput} input - Clube e filtros.
   * @returns {Promise<string>} Conteúdo do arquivo, em UTF-8 e sem BOM.
   */
  async execute(input: FindClubTransactionsInput): Promise<string> {
    const transactions = await loadClubTransactions(
      this.transferRepository,
      input,
    );
    return toTransactionsCsv(transactions);
  }
}
