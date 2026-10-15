import { Formation } from '../../../domain/formation.js';

/**
 * Dados de entrada da troca de escalação (PUT /clubs/{id}/lineup).
 *
 * @export
 * @interface UpdateLineupInput
 */
export interface UpdateLineupInput {
  /** Clube da URL */
  clubId: number;
  /** Formação dos 4 jogadores de linha */
  formation: Formation;
  /** Os 5 titulares, em qualquer ordem, já validados (distintos e positivos) */
  playerIds: number[];
}
