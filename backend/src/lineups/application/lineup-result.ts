import { compareSquadOrder } from '../../players/domain/squad-order.js';
import { isLineupComplete } from '../domain/formation.js';
import { StoredLineup } from './interfaces/repositories/lineup.repository.interface.js';
import { LineupOutput } from './usecases/get-lineup/lineup.output.js';

/** Titulares na ordem do elenco (RN11) e se a escalação está completa (RN19) */
export function describeLineup(lineup: StoredLineup): LineupOutput {
  const starters = [...lineup.starters].sort(compareSquadOrder);
  return {
    clubId: lineup.clubId,
    formation: lineup.formation,
    complete: isLineupComplete(lineup.formation, starters.length),
    starters,
  };
}
