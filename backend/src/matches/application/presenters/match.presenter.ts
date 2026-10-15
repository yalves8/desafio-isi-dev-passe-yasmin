import { formatBrasiliaDateTime } from '../../../common/utils/date.js';
import {
  DuelPlayerRecord,
  StoredMatch,
} from '../interfaces/repositories/match.repository.interface.js';

const sideOutput = (side: StoredMatch['home']) => ({
  club_id: side.clubId,
  club_name: side.clubName,
  formation: side.formation,
  goals: side.goals,
});

const duelPlayerOutput = (p: DuelPlayerRecord) => ({
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
 * @returns Partida no formato da API.
 */
export function toMatchOutput(match: StoredMatch, withDuels: boolean) {
  return {
    id: match.id,
    played_at: formatBrasiliaDateTime(match.playedAt),
    home: sideOutput(match.home),
    away: sideOutput(match.away),
    result: match.result,
    ...(withDuels
      ? {
          duels: match.duels.map((d) => ({
            order: d.order,
            attacking_club_id: d.attackingClubId,
            attacker: duelPlayerOutput(d.attacker),
            defender: duelPlayerOutput(d.defender),
            goal: d.goal,
          })),
        }
      : {}),
  };
}

export type MatchOutput = ReturnType<typeof toMatchOutput>;
