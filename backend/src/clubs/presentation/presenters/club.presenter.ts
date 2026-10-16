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
    cash: club.cash,
    squad_value: club.squadValue,
    net_worth: club.netWorth,
  };
}

function toSquadPlayerResponse(
  clubId: number,
  { player, contract }: SquadMember,
): SquadPlayerResponse {
  return {
    ...toPlayerResponse(player),
    club_id: clubId,
    contract: contract && {
      purchase_value: contract.purchaseValue,
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
