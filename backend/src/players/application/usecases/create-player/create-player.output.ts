import { Condition } from '../../../../domain/market-value.js';
import { Position } from '../../../../domain/player-rating.js';

/**
 * Dados de saída retornados pelo caso de uso de criação de jogador.
 *
 * @export
 * @interface CreatePlayerOutput
 */
export interface CreatePlayerOutput {
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
