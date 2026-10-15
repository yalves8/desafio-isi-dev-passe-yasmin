import { ClubSortEnum } from '../../../domain/enums/club-sort.enum.js';

export type ClubSortCriteria =
  ClubSortEnum | 'name' | 'net_worth_asc' | 'net_worth_desc';

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
