import { formatBrasiliaDateTime } from '../../../common/utils/date.js';
import {
  DuelPlayerRecord,
  StoredMatch,
} from '../../application/interfaces/repositories/match.repository.interface.js';
import {
  DuelPlayerResponse,
  MatchResponse,
  MatchSideResponse,
} from '../responses/match.response.js';

const sideResponse = (side: StoredMatch['home']): MatchSideResponse => ({
  club_id: side.clubId,
  club_name: side.clubName,
  formation: side.formation,
  goals: side.goals,
});

const duelPlayerResponse = (p: DuelPlayerRecord): DuelPlayerResponse => ({
  player_id: p.playerId,
  player_name: p.playerName,
  position: p.position,
  condition: p.condition,
  attribute: p.attribute,
  value: p.value,
});

/**
 * Partida no formato da API (2.4.2): placar, formações, `result` e, com `withDuels`, os 6 duelos
 * com os valores gravados (nada é recalculado, RN20 passo 7).
 *
 * @param {StoredMatch} match - Partida gravada.
 * @param {boolean} withDuels - Inclui `duels` (POST e GET /matches/{id}); a listagem não traz.
 * @returns {MatchResponse} Partida no formato da API.
 */
export function toMatchResponse(
  match: StoredMatch,
  withDuels: boolean,
): MatchResponse {
  return {
    id: match.id,
    played_at: formatBrasiliaDateTime(match.playedAt),
    home: sideResponse(match.home),
    away: sideResponse(match.away),
    result: match.result,
    ...(withDuels
      ? {
          duels: match.duels.map((d) => ({
            order: d.order,
            attacking_club_id: d.attackingClubId,
            attacker: duelPlayerResponse(d.attacker),
            defender: duelPlayerResponse(d.defender),
            goal: d.goal,
          })),
        }
      : {}),
  };
}
