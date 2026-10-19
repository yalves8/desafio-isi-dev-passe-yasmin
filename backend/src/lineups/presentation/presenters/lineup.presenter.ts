import { toPlayerResponse } from '../../../players/presentation/presenters/player.presenter.js';
import { LineupOutput } from '../../application/usecases/get-lineup/lineup.output.js';
import { LineupResponse } from '../responses/lineup.response.js';

/** Escalação no formato da API (2.4.1): cada titular com os campos de GET /players/{id} */
export function toLineupResponse(lineup: LineupOutput): LineupResponse {
  return {
    club_id: lineup.clubId,
    formation: lineup.formation,
    complete: lineup.complete,
    players: lineup.starters.map(toPlayerResponse),
  };
}
