import { Position } from '../../../../domain/player-rating.js';

/**
 * Dados de entrada para o caso de uso de criação de jogador.
 *
 * @export
 * @interface CreatePlayerInput
 */
export interface CreatePlayerInput {
  name: string;
  position: Position;
  agility: number;
  age: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
}
