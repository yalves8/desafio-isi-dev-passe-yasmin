import { PlayerEntity } from '../../../domain/entities/player.entity.js';

/**
 * Página da listagem (RN07), sem formato de transporte: os jogadores da página e a contagem
 * de todos os que atendem à busca e aos filtros.
 *
 * @export
 * @interface FindPlayersOutput
 */
export interface FindPlayersOutput {
  players: PlayerEntity[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
