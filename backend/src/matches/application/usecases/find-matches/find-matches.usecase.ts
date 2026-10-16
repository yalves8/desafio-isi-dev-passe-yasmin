import { FindMatchesInput } from './find-matches.input.js';
import { NotFoundError } from '../../../../common/errors/domain.errors.js';
import { IMatchRepository } from '../../interfaces/repositories/match.repository.interface.js';
import { toMatchOutput } from '../../presenters/match.presenter.js';
import { MatchOutput } from '../find-match-by-id/match.output.js';

/**
 * Caso de uso do histórico de partidas (GET /matches, RN21).
 *
 * Da mais recente para a mais antiga (no mesmo instante, maior id), sem os duelos; `clubId`
 * filtra as partidas em que o clube foi mandante ou visitante (clube inexistente → 404).
 *
 * @export
 * @class FindMatchesUseCase
 */
export class FindMatchesUseCase {
  /**
   * Construtor do `FindMatchesUseCase`.
   *
   * @param {IMatchRepository} matchRepository - Repositório de partidas.
   */
  constructor(private readonly matchRepository: IMatchRepository) {}

  /**
   * Executa a consulta.
   *
   * @param {{ clubId?: number }} input - Filtro opcional por clube.
   * @returns {Promise<MatchOutput[]>} Partidas sem duelos.
   * @throws {NotFoundError} Clube do filtro inexistente.
   */
  async execute({ clubId }: FindMatchesInput): Promise<MatchOutput[]> {
    if (
      clubId !== undefined &&
      !(await this.matchRepository.clubExists(clubId))
    ) {
      throw new NotFoundError('Clube não encontrado');
    }
    const matches = await this.matchRepository.findMany(clubId);
    return matches.map((match) => toMatchOutput(match, false));
  }
}
