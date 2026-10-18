import { ClubSortCriteria } from '../../../domain/club-sort.js';

export type { ClubSortCriteria };

/**
 * Dados de entrada para o caso de uso de listagem de clubes.
 *
 * @export
 * @interface FindClubsInput
 */
export interface FindClubsInput {
  /** Critério de ordenação da lista ('name' por padrão, ou por patrimônio) */
  sort?: ClubSortCriteria;
}
