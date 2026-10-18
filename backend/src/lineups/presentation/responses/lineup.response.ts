import { DuelRole } from '../../../domain/match-engine.js';
import { PlayerResponse } from '../../../players/presentation/responses/player.response.js';
import { Formation } from '../../domain/formation.js';

/**
 * Escalação no contrato da API REST (2.4.1): campos em snake_case.
 *
 * @export
 * @interface LineupResponse
 */
export interface LineupResponse {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: PlayerResponse[];
  /** Papel de cada vaga nos duelos, na ordem goleiro e linha de trás para frente (RN20) */
  duel_roles: readonly (readonly DuelRole[])[];
}
