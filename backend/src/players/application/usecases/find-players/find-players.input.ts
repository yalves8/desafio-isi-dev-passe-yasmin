import { Condition } from '../../../../domain/market-value.js';
import { Position } from '../../../../domain/player-rating.js';
import { PlayerSortCriteria } from '../../../domain/player-listing.js';

export type { PlayerSortCriteria };

/**
 * Busca, filtros, ordenação e página da listagem de jogadores (RN07), já validados.
 *
 * @export
 * @interface FindPlayersInput
 */
export interface FindPlayersInput {
  search?: string;
  position?: Position;
  condition?: Condition;
  free?: boolean;
  clubId?: number;
  minAge?: number;
  maxAge?: number;
  minValue?: number;
  maxValue?: number;
  sort: PlayerSortCriteria[];
  page: number;
  limit: number;
}
