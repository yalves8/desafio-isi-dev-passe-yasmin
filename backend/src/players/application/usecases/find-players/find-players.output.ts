import { FindPlayerByIdOutput } from '../find-player-by-id/find-player-by-id.output.js';

export interface PlayersPaginationMetaOutput {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

/**
 * Resposta paginada contendo atletas e metadados de paginação.
 *
 * @export
 * @interface FindPlayersOutput
 */
export interface FindPlayersOutput {
  data: FindPlayerByIdOutput[];
  meta: PlayersPaginationMetaOutput;
}
