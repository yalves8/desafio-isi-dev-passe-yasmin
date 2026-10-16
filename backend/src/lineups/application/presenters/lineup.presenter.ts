import { toPlayerOutput } from '../../../players/application/presenters/player.presenter.js';
import { compareSquadOrder } from '../../../players/domain/squad-order.js';
import { isLineupComplete } from '../../domain/formation.js';
import { StoredLineup } from '../interfaces/repositories/lineup.repository.interface.js';
import { LineupOutput } from '../usecases/get-lineup/lineup.output.js';

/** Escalação no formato da API (RN19, item 6): titulares na ordem do elenco (RN11) e `complete` */
export function toLineupOutput(lineup: StoredLineup): LineupOutput {
  const players = [...lineup.starters].sort(compareSquadOrder);
  return {
    club_id: lineup.clubId,
    formation: lineup.formation,
    complete: isLineupComplete(lineup.formation, players.length),
    players: players.map(toPlayerOutput),
  };
}
