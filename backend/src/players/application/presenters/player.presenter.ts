import { PlayerEntity } from '../../domain/entities/player.entity.js';
import { FindPlayerByIdOutput } from '../usecases/find-player-by-id/find-player-by-id.output.js';

/**
 * Jogador no formato de `GET /players/{id}`, com overall e valor de mercado calculados
 * na hora (RN05 e RN06). Usado também na escalação (RN19), que devolve os mesmos campos.
 *
 * @param {PlayerEntity} player - Entidade do jogador.
 * @returns {FindPlayerByIdOutput} Jogador no formato da API.
 */
export function toPlayerOutput(player: PlayerEntity): FindPlayerByIdOutput {
  return {
    id: player.id,
    name: player.getName(),
    position: player.getPosition(),
    agility: player.getAgility(),
    age: player.getAge(),
    condition: player.getCondition(),
    base_value: player.baseValue,
    market_value: player.calculateMarketValue(),
    pace: player.attributes.pace,
    shooting: player.attributes.shooting,
    passing: player.attributes.passing,
    dribbling: player.attributes.dribbling,
    defending: player.attributes.defending,
    physical: player.attributes.physical,
    potential: player.potential,
    overall: player.calculateOverall(),
    club_id: player.getClubId(),
  };
}
