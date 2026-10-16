import { Standing } from '../../domain/standings.js';
import { StandingResponse } from '../responses/standing.response.js';

/** Linha da classificação no formato da API (2.4.3) */
export function toStandingResponse(standing: Standing): StandingResponse {
  return {
    position: standing.position,
    club_id: standing.clubId,
    club_name: standing.clubName,
    played: standing.played,
    wins: standing.wins,
    draws: standing.draws,
    losses: standing.losses,
    goals_for: standing.goalsFor,
    goals_against: standing.goalsAgainst,
    goal_difference: standing.goalDifference,
    points: standing.points,
  };
}
