/**
 * Linha da classificação no formato da API (2.4.3).
 *
 * @export
 * @interface StandingOutput
 */
export interface StandingOutput {
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

/** Classificação com todos os clubes, na ordem da RN21, calculada a cada consulta */
export type GetStandingsOutput = StandingOutput[];
