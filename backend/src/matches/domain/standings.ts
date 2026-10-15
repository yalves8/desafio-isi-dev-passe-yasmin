import { compareNames } from '../../common/utils/text.js';

const POINTS = { win: 3, draw: 1, loss: 0 } as const;

/**
 * Linha da classificação no formato da API (RN21).
 *
 * @export
 * @interface StandingRow
 */
export interface StandingRow {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

/** Placar de uma partida jogada */
export interface PlayedScore {
  homeClubId: number;
  awayClubId: number;
  homeGoals: number;
  awayGoals: number;
}

/**
 * Classificação de todos os clubes, calculada a cada consulta e nunca gravada (RN21).
 *
 * Ordem: mais pontos (vitória 3, empate 1, derrota 0), maior saldo, mais gols marcados e
 * nome do clube em ordem alfabética (minúsculas, sem acentos); no empate de nome, id.
 * Clubes sem partidas entram zerados. `position` vai de 1 ao total, sem repetir.
 *
 * @param {{ id: number; name: string }[]} clubs - Todos os clubes da liga.
 * @param {PlayedScore[]} matches - Placar de todas as partidas.
 * @returns {StandingRow[]} Classificação ordenada.
 */
export function computeStandings(
  clubs: { id: number; name: string }[],
  matches: PlayedScore[],
): StandingRow[] {
  const rows = new Map(
    clubs.map((club) => [
      club.id,
      {
        position: 0,
        club_id: club.id,
        club_name: club.name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0,
      },
    ]),
  );

  const record = (clubId: number, scored: number, conceded: number) => {
    const row = rows.get(clubId);
    if (!row) return;
    row.played++;
    row.goals_for += scored;
    row.goals_against += conceded;
    if (scored > conceded) row.wins++;
    else if (scored === conceded) row.draws++;
    else row.losses++;
  };
  for (const m of matches) {
    record(m.homeClubId, m.homeGoals, m.awayGoals);
    record(m.awayClubId, m.awayGoals, m.homeGoals);
  }

  const table = [...rows.values()].map((row) => ({
    ...row,
    goal_difference: row.goals_for - row.goals_against,
    points:
      row.wins * POINTS.win +
      row.draws * POINTS.draw +
      row.losses * POINTS.loss,
  }));
  table.sort(
    (a, b) =>
      b.points - a.points ||
      b.goal_difference - a.goal_difference ||
      b.goals_for - a.goals_for ||
      compareNames(a.club_name, b.club_name) ||
      a.club_id - b.club_id,
  );
  return table.map((row, index) => ({ ...row, position: index + 1 }));
}
