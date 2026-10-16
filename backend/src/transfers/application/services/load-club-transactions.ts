import { NotFoundError } from '../../../common/errors/domain.errors.js';
import {
  ITransferRepository,
  TransactionRecord,
} from '../interfaces/repositories/transfer.repository.interface.js';
import { FindClubTransactionsInput } from '../usecases/find-club-transactions/find-club-transactions.input.js';

/**
 * Histórico do clube com os filtros (RN17 e RN18), usado pela consulta e pela exportação.
 * Clube ou jogador do filtro inexistente (inclusive excluído) → 404.
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
