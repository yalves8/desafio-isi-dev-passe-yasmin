import { DuelRole } from '../../../../domain/match-engine.js';
import { PlayerEntity } from '../../../../players/domain/entities/player.entity.js';
import { Formation } from '../../../domain/formation.js';

/**
 * Escalação do clube (RN19, item 6), sem formato de transporte: formação salva, se está
 * completa e os titulares na ordem do elenco (RN11).
 *
 * @export
 * @interface LineupOutput
 */
export interface LineupOutput {
  clubId: number;
  formation: Formation | null;
  complete: boolean;
  starters: PlayerEntity[];
  /** Papel de cada vaga nos duelos, na ordem goleiro e linha de trás para frente (RN20) */
  duelRoles: readonly (readonly DuelRole[])[];
}
