import { Controller, Get } from '@nestjs/common';
import { GetStandingsUseCase } from '../../application/usecases/get-standings/get-standings.usecase.js';

/**
 * Controller da classificação (RN21), calculada a cada consulta.
 *
 * @export
 * @class StandingsController
 */
@Controller('standings')
export class StandingsController {
  /**
   * Construtor do `StandingsController`.
   *
   * @param {GetStandingsUseCase} getStandingsUseCase - Cálculo da classificação.
   */
  constructor(private readonly getStandingsUseCase: GetStandingsUseCase) {}

  /**
   * Classificação de todos os clubes.
   *
   * @returns {Promise<StandingRow[]>} De 1 ao total de clubes.
   */
  @Get()
  async find() {
    return this.getStandingsUseCase.execute();
  }
}
