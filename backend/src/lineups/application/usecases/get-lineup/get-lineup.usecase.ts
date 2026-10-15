import { NotFoundError } from '../../../../common/errors/domain.errors.js';
import { toPlayerOutput } from '../../../../players/application/presenters/player.presenter.js';
import { compareSquadOrder } from '../../../../players/domain/squad-order.js';
import { LINEUP_SIZE } from '../../../domain/formation.js';
import {
  ILineupRepository,
  StoredLineup,
} from '../../interfaces/repositories/lineup.repository.interface.js';
import { LineupOutput } from './lineup.output.js';

/** Escalação gravada no formato da API: titulares na ordem do elenco e `complete` (RN19, item 6) */
export function toLineupOutput(lineup: StoredLineup): LineupOutput {
  const players = [...lineup.starters].sort(compareSquadOrder);
  return {
    club_id: lineup.clubId,
    formation: lineup.formation,
    complete: lineup.formation !== null && players.length === LINEUP_SIZE,
    players: players.map(toPlayerOutput),
  };
}

/**
 * Caso de uso da consulta da escalação do clube (GET /clubs/{id}/lineup).
 *
 * Regras aplicadas (RN19, item 6):
 * 1. Clube inexistente → 404.
 * 2. Sem escalação: `formation` null, `players` vazio e `complete` false.
 * 3. Com titular vendido ou DOENTE: a formação salva continua, `players` traz quem sobrou e
 *    `complete` vem false.
 *
 * @export
 * @class GetLineupUseCase
 */
export class GetLineupUseCase {
  /**
   * Construtor do `GetLineupUseCase`.
   *
   * @param {ILineupRepository} lineupRepository - Repositório de escalação.
   */
  constructor(private readonly lineupRepository: ILineupRepository) {}

  /**
   * Executa a consulta.
   *
   * @param {{ clubId: number }} input - Clube da URL.
   * @returns {Promise<LineupOutput>} Escalação atual.
   * @throws {NotFoundError} Clube inexistente.
   */
  async execute({ clubId }: { clubId: number }): Promise<LineupOutput> {
    const lineup = await this.lineupRepository.findByClub(clubId);
    if (!lineup) throw new NotFoundError('Clube não encontrado');
    return toLineupOutput(lineup);
  }
}
