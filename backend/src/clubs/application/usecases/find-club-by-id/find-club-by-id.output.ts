import { Condition } from '../../../../domain/market-value.js';
import { Position } from '../../../../domain/player-rating.js';

export interface ClubPlayerItemOutput {
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
  club_id: number;
  contract?: {
    purchase_value: number;
    loyalty_until: string;
    remaining_days: number;
    penalty_rate: number;
  } | null;
}

/**
 * Dados de saída com detalhes completos do clube e seu elenco ordenado.
 *
 * @export
 * @interface FindClubByIdOutput
 */
export interface FindClubByIdOutput {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
  players: ClubPlayerItemOutput[];
}
