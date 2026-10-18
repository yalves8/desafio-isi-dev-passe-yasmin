import { DuelValue } from '../../../domain/match-engine.js';
import { formatBrasiliaDateTime } from '../../../common/utils/date.js';
import { toPlayerResponse } from '../../../players/presentation/presenters/player.presenter.js';
import {
  FindClubByIdOutput,
  SquadMember,
} from '../../application/usecases/find-club-by-id/find-club-by-id.output.js';
import { ClubSummary } from '../../application/usecases/find-clubs/find-clubs.output.js';
import {
  ClubDetailsResponse,
  ClubResponse,
  SquadPlayerResponse,
} from '../responses/club.response.js';

/** Clube no formato da API (2.2) */
export function toClubResponse(club: ClubSummary): ClubResponse {
  return {
    id: club.id,
    name: club.name,
    acronym: club.acronym,
    cash: club.cash.toNumber(),
    squad_value: club.squadValue.toNumber(),
    net_worth: club.netWorth.toNumber(),
  };
}

function toSquadPlayerResponse(
  clubId: number,
  { player, contract, duel }: SquadMember,
): SquadPlayerResponse {
  const toDuelValue = ({ attribute, value, matchValue }: DuelValue) => ({
    attribute,
    value,
    match_value: matchValue,
  });
  return {
    ...toPlayerResponse(player),
    club_id: clubId,
    duel: {
      attack: toDuelValue(duel.attack),
      defense: toDuelValue(duel.defense),
    },
    contract: contract && {
      purchase_value: contract.purchaseValue.toNumber(),
      loyalty_until: formatBrasiliaDateTime(contract.loyaltyUntil),
      remaining_days: contract.remainingDays,
      penalty_rate: contract.penaltyRate,
    },
  };
}

/** Clube com o elenco no formato da API (2.2.2) */
export function toClubDetailsResponse(
  club: FindClubByIdOutput,
): ClubDetailsResponse {
  return {
    ...toClubResponse(club),
    players: club.squad.map((member) => toSquadPlayerResponse(club.id, member)),
  };
}
