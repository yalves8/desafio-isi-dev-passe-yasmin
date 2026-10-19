import { DUEL_ROLES, DuelValue } from '../../../domain/match-engine.js';
import { formatBrasiliaDateTime } from '../../../common/utils/date.js';
import { toPlayerResponse } from '../../../players/presentation/presenters/player.presenter.js';
import {
  FindClubByIdOutput,
  SquadMember,
} from '../../application/usecases/find-club-by-id/find-club-by-id.output.js';
import { ClubSummary } from '../../application/usecases/find-clubs/find-clubs.output.js';
import {
  ClubDetailsResponse,
  ClubDuelAttributesResponse,
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
  { player, contract }: SquadMember,
): SquadPlayerResponse {
  return {
    ...toPlayerResponse(player),
    club_id: clubId,
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

function toDuelValueResponse({ attribute, value, matchValue }: DuelValue) {
  return { attribute, value, match_value: matchValue };
}

/**
 * Atributos de duelo do elenco (GET /clubs/{id}/duel-attributes): o papel de cada vaga da
 * escalação e o que cada jogador usa ao atacar e ao defender (RN20). Fica fora de
 * GET /clubs/{id} e GET /clubs/{id}/lineup para não mudar o formato do enunciado.
 */
export function toClubDuelAttributesResponse(
  club: FindClubByIdOutput,
): ClubDuelAttributesResponse {
  return {
    club_id: club.id,
    roles: DUEL_ROLES,
    players: club.squad.map(({ player, duel }) => ({
      id: player.id,
      attack: toDuelValueResponse(duel.attack),
      defense: toDuelValueResponse(duel.defense),
    })),
  };
}
