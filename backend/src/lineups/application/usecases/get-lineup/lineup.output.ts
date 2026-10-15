import { FindPlayerByIdOutput } from '../../../../players/application/usecases/find-player-by-id/find-player-by-id.output.js';
import { Formation } from '../../../domain/formation.js';

/**
 * Escalação no formato da API (2.4.1): `players` na ordem do elenco (RN11), cada um com os
 * campos de `GET /players/{id}`.
 *
 * @export
 * @interface LineupOutput
 */
export interface LineupOutput {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: FindPlayerByIdOutput[];
}
