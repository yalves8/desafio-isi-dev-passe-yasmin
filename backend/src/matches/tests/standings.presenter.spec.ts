import { describe, expect, it } from 'vitest';
import { toStandingOutput } from '../application/presenters/standings.presenter.js';

describe('toStandingOutput (2.4.3)', () => {
  it('deve devolver a linha da classificação com os campos da API', () => {
    expect(
      toStandingOutput({
        position: 1,
        clubId: 4,
        clubName: 'Gama SC',
        played: 2,
        wins: 2,
        draws: 0,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 1,
        goalDifference: 2,
        points: 6,
      }),
    ).toEqual({
      position: 1,
      club_id: 4,
      club_name: 'Gama SC',
      played: 2,
      wins: 2,
      draws: 0,
      losses: 0,
      goals_for: 3,
      goals_against: 1,
      goal_difference: 2,
      points: 6,
    });
  });
});
