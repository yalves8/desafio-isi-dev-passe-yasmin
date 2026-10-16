import { Condition } from '../../../domain/market-value.js';
import { Position } from '../../../domain/player-rating.js';

/**
 * Jogador no contrato da API REST (2.1.2): campos em snake_case e valores em moedas.
 *
 * @export
 * @interface PlayerResponse
 */
export interface PlayerResponse {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
  condition: Condition;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
}

/** Página da listagem (RN07, 2.1.1): `data` e `meta` */
export interface PlayersPageResponse {
  data: PlayerResponse[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}
