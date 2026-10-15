import { NotFoundError } from '../../../../common/errors/domain.errors.js';
import { IMatchRepository } from '../../interfaces/repositories/match.repository.interface.js';
import {
  MatchOutput,
  toMatchOutput,
} from '../../presenters/match.presenter.js';

/**
 * Caso de uso da partida com os 6 duelos (GET /matches/{id}, RN21).
 *
 * @export
 * @class FindMatchByIdUseCase
 */
export class FindMatchByIdUseCase {
  /**
   * Construtor do `FindMatchByIdUseCase`.
   *
   * @param {IMatchRepository} matchRepository - Repositório de partidas.
   */
  constructor(private readonly matchRepository: IMatchRepository) {}

  /**
   * Executa a consulta.
   *
   * @param {{ id: number }} input - Partida da URL.
   * @returns {Promise<MatchOutput>} Partida com os duelos gravados.
   * @throws {NotFoundError} Partida inexistente.
   */
  async execute({ id }: { id: number }): Promise<MatchOutput> {
    const match = await this.matchRepository.findById(id);
    if (!match) throw new NotFoundError('Partida não encontrada');
    return toMatchOutput(match, true);
  }
}
