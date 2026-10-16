import { summarizeTransactions } from '../../../domain/transactions-summary.js';
import { ITransferRepository } from '../../interfaces/repositories/transfer.repository.interface.js';
import { loadClubTransactions } from '../../services/load-club-transactions.js';
import { FindClubTransactionsInput } from './find-club-transactions.input.js';
import { FindClubTransactionsOutput } from './find-club-transactions.output.js';

/**
 * Caso de uso do histórico de transações do clube (RN17).
 *
 * Regras aplicadas:
 * 1. Clube inexistente → 404; jogador do filtro inexistente ou excluído → 404.
 * 2. Da mais recente para a mais antiga; no empate de data e hora, id decrescente.
 * 3. Valores e nome do momento de cada operação, como foram gravados.
 * 4. `summary` com os totais das transações filtradas; sem transações, tudo 0,00.
 *
 * @export
 * @class FindClubTransactionsUseCase
 */
export class FindClubTransactionsUseCase {
  /**
   * Construtor do `FindClubTransactionsUseCase`.
   *
   * @param {ITransferRepository} transferRepository - Repositório de compra e venda.
   */
  constructor(private readonly transferRepository: ITransferRepository) {}

  /**
   * Executa a consulta do histórico.
   *
   * @param {FindClubTransactionsInput} input - Clube e filtros.
   * @returns {Promise<FindClubTransactionsOutput>} Transações e totais.
   */
  async execute(
    input: FindClubTransactionsInput,
  ): Promise<FindClubTransactionsOutput> {
    const transactions = await loadClubTransactions(
      this.transferRepository,
      input,
    );
    return {
      transactions,
      summary: summarizeTransactions(transactions),
    };
  }
}
