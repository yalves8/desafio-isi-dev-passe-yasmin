import { FindPlayerByIdOutput } from '../../../../players/application/usecases/find-player-by-id/find-player-by-id.output.js';

/** Jogador do elenco: os campos de GET /players/{id} e o contrato ativo (RN11, RN15) */
export interface ClubPlayerItemOutput extends FindPlayerByIdOutput {
  club_id: number;
  contract: {
    purchase_value: number;
    loyalty_until: string;
    remaining_days: number;
    penalty_rate: number;
  } | null;
}

/**
 * Dados de saída com detalhes completos do clube e seu elenco ordenado.
 *
 * @export
 * @interface FindClubByIdOutput
 */
export interface FindClubByIdOutput {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
  players: ClubPlayerItemOutput[];
}
