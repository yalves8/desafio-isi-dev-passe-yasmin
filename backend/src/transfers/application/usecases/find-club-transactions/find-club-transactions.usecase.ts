import { NotFoundError } from '../../../../common/errors/domain.errors.js';
import { formatBrasiliaDateTime } from '../../../../common/utils/date.js';
import { Cents, fromCents } from '../../../../domain/money.js';
import {
  ITransferRepository,
  TransactionRecord,
} from '../../interfaces/repositories/transfer.repository.interface.js';
import { FindClubTransactionsInput } from './find-club-transactions.input.js';
import {
  FindClubTransactionsOutput,
  TransactionsSummaryOutput,
} from './find-club-transactions.output.js';

/**
 * Lê as transações do clube com os filtros, depois de conferir clube e jogador (404).
 * Compartilhado pelo histórico e pela exportação CSV, que aceitam os mesmos filtros (RN18).
 *
 * @param {ITransferRepository} repository - Repositório de compra e venda.
 * @param {FindClubTransactionsInput} input - Clube e filtros.
 * @returns {Promise<TransactionRecord[]>} Transações na ordem do histórico.
 * @throws {NotFoundError} Clube inexistente ou jogador do filtro inexistente ou excluído.
 */
export async function loadClubTransactions(
  repository: ITransferRepository,
  { clubId, types, playerId }: FindClubTransactionsInput,
): Promise<TransactionRecord[]> {
  if (!(await repository.clubExists(clubId))) {
    throw new NotFoundError('Clube não encontrado');
  }
  if (
    playerId !== undefined &&
    !(await repository.activePlayerExists(playerId))
  ) {
    throw new NotFoundError('Jogador não encontrado');
  }
  return repository.findClubTransactions(clubId, { types, playerId });
}

/** Totais das transações filtradas, somados em centavos (RN17) */
function summarize(
  transactions: TransactionRecord[],
): TransactionsSummaryOutput {
  let spent: Cents = 0;
  let received: Cents = 0;
  let fees: Cents = 0;
  let penalties: Cents = 0;
  let profit: Cents = 0;
  for (const t of transactions) {
    fees += t.fee;
    if (t.type === 'COMPRA') {
      spent += t.value + t.fee;
    } else {
      received += t.cashChange;
      penalties += t.penalty;
      profit += t.profit ?? 0;
    }
  }
  return {
    total_spent: fromCents(spent),
    total_received: fromCents(received),
    total_fees: fromCents(fees),
    total_penalties: fromCents(penalties),
    total_profit: fromCents(profit),
  };
}

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
      data: transactions.map((t) => ({
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
      })),
      summary: summarize(transactions),
    };
  }
}
