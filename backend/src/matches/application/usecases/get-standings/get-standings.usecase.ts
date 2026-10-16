import { computeStandings, Standing } from '../../../domain/standings.js';
import { IMatchRepository } from '../../interfaces/repositories/match.repository.interface.js';

/**
 * Caso de uso da classificação (GET /standings, RN21): todos os clubes, calculada a cada
 * consulta a partir das partidas gravadas, nunca gravada.
 *
 * @export
 * @class GetStandingsUseCase
 */
export class GetStandingsUseCase {
  /**
   * Construtor do `GetStandingsUseCase`.
   *
   * @param {IMatchRepository} matchRepository - Repositório de partidas.
   */
  constructor(private readonly matchRepository: IMatchRepository) {}

  /**
   * Executa o cálculo.
   *
   * @returns {Promise<Standing[]>} Classificação de 1 ao total de clubes.
   */
  async execute(): Promise<Standing[]> {
    const { clubs, scores } = await this.matchRepository.findStandingsData();
    return computeStandings(clubs, scores);
  }
}
