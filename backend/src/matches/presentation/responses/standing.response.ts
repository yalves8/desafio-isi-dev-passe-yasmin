/**
 * Linha da classificação no contrato da API REST (2.4.3): campos em snake_case.
 *
 * @export
 * @interface StandingResponse
 */
export interface StandingResponse {
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
export type StandingsResponse = StandingResponse[];
