import { PlayerResponse } from '../../../players/presentation/responses/player.response.js';

/**
 * Clube no contrato da API REST (2.2): campos em snake_case e valores em moedas.
 *
 * @export
 * @interface ClubResponse
 */
export interface ClubResponse {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

/** Jogador do elenco: os campos de GET /players/{id} e o contrato ativo (2.2.2) */
export interface SquadPlayerResponse extends PlayerResponse {
  club_id: number;
  contract: {
    purchase_value: number;
    loyalty_until: string;
    remaining_days: number;
    penalty_rate: number;
  } | null;
}

/** Clube com o elenco na ordem da RN11 (2.2.2) */
export interface ClubDetailsResponse extends ClubResponse {
  players: SquadPlayerResponse[];
}
