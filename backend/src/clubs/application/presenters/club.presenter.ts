import { formatBrasiliaDateTime } from '../../../common/utils/date.js';
import { PlayerEntity } from '../../../players/domain/entities/player.entity.js';
import { toPlayerOutput } from '../../../players/application/presenters/player.presenter.js';
import { ClubEntity } from '../../domain/entities/club.entity.js';
import { ClubPlayerItemOutput } from '../usecases/find-club-by-id/find-club-by-id.output.js';
import { ClubSummaryItemOutput } from '../usecases/find-clubs/find-clubs.output.js';

/** Clube no formato da API (2.2): caixa, valor do elenco e patrimônio calculados na hora (RN11) */
export function toClubOutput(
  club: ClubEntity,
  players: PlayerEntity[],
): ClubSummaryItemOutput {
  return {
    id: club.id,
    name: club.name,
    acronym: club.acronym,
    cash: club.getCash(),
    squad_value: club.calculateSquadValue(players),
    net_worth: club.calculateNetWorth(players),
  };
}

/** Jogador do elenco com o contrato: fim da fidelidade, dias restantes e % de multa agora (RN11, RN15) */
export function toSquadPlayerOutput(
  club: ClubEntity,
  player: PlayerEntity,
  now: Date,
): ClubPlayerItemOutput {
  const contract = player.getActiveContract();
  const penalty = player.calculateContractPenalty(now);
  return {
    ...toPlayerOutput(player),
    club_id: club.id,
    contract:
      contract && penalty
        ? {
            purchase_value: contract.purchaseValue,
            loyalty_until: formatBrasiliaDateTime(contract.loyaltyUntil),
            remaining_days: penalty.daysRemaining,
            penalty_rate: penalty.percent,
          }
        : null,
  };
}
