import { Position } from '../../../../domain/player-rating.js';

/**
 * Dados de entrada para o caso de uso de edição de jogador (RN08).
 *
 * @export
 * @interface UpdatePlayerInput
 */
export interface UpdatePlayerInput {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
}
