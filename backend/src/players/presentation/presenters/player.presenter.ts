import { FindPlayersOutput } from '../../application/usecases/find-players/find-players.output.js';
import { PlayerEntity } from '../../domain/entities/player.entity.js';
import {
  PlayerResponse,
  PlayersPageResponse,
} from '../responses/player.response.js';

/** Jogador no formato da API: overall e valor de mercado calculados na hora (RN05, RN06) */
export function toPlayerResponse(player: PlayerEntity): PlayerResponse {
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

/** Página da listagem no formato da API (2.1.1) */
export function toPlayersPageResponse(
  page: FindPlayersOutput,
): PlayersPageResponse {
  return {
    data: page.players.map(toPlayerResponse),
    meta: {
      page: page.page,
      limit: page.limit,
      total_items: page.totalItems,
      total_pages: page.totalPages,
    },
  };
}
