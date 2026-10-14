import { Condition } from '../../../../domain/market-value.js';
import { Position } from '../../../../domain/player-rating.js';

/**
 * Parâmetros de consulta, filtros e ordenação para listagem de jogadores (RN07).
 *
 * @export
 * @interface FindPlayersInput
 */
export interface FindPlayersInput {
  search?: string;
  position?: Position;
  condition?: Condition;
  free?: boolean;
  club_id?: number;
  min_age?: number;
  max_age?: number;
  min_value?: number;
  max_value?: number;
  sort: string[];
  page: number;
  limit: number;
}
