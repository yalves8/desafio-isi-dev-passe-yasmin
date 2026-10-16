import { PlayerEntity } from '../../players/domain/entities/player.entity.js';
import { ClubEntity } from '../domain/entities/club.entity.js';
import { ClubSummary } from './usecases/find-clubs/find-clubs.output.js';

/** Caixa, valor do elenco e patrimônio do clube, calculados a cada consulta (RN11) */
export function summarizeClub(
  club: ClubEntity,
  players: PlayerEntity[],
): ClubSummary {
  return {
    id: club.id,
    name: club.name,
    acronym: club.acronym,
    cash: club.getCash(),
    squadValue: club.calculateSquadValue(players),
    netWorth: club.calculateNetWorth(players),
  };
}
