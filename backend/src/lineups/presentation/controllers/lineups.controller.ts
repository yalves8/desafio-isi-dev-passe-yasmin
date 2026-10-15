import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ParseIdPipe } from '../../../common/pipes/parse-id.pipe.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { GetLineupUseCase } from '../../application/usecases/get-lineup/get-lineup.usecase.js';
import { UpdateLineupUseCase } from '../../application/usecases/update-lineup/update-lineup.usecase.js';
import type { UpdateLineupDto } from '../dtos/update-lineup.dto.js';
import { updateLineupSchema } from '../dtos/update-lineup.dto.js';

/**
 * Controller da escalação do clube (RN19), sob `/clubs/{id}/lineup` como no enunciado.
 *
 * @export
 * @class LineupsController
 */
@Controller('clubs')
export class LineupsController {
  /**
   * Construtor do `LineupsController`.
   *
   * @param {GetLineupUseCase} getLineupUseCase - Consulta da escalação.
   * @param {UpdateLineupUseCase} updateLineupUseCase - Troca da escalação.
   */
  constructor(
    private readonly getLineupUseCase: GetLineupUseCase,
    private readonly updateLineupUseCase: UpdateLineupUseCase,
  ) {}

  /**
   * Escalação atual do clube.
   *
   * @param {number} id - Clube da URL (inválido → 404).
   * @returns {Promise<LineupOutput>} Formação, `complete` e titulares na ordem do elenco.
   */
  @Get(':id/lineup')
  async find(@Param('id', ParseIdPipe) id: number) {
    return this.getLineupUseCase.execute({ clubId: id });
  }

  /**
   * Escolhe a formação e escala os 5 titulares, substituindo a escalação inteira.
   *
   * @param {number} id - Clube da URL (inválido → 404).
   * @param {UpdateLineupDto} dto - Formação e titulares.
   * @returns {Promise<LineupOutput>} 200 com a escalação gravada.
   */
  @Put(':id/lineup')
  async update(
    @Param('id', ParseIdPipe) id: number,
    @Body(new ZodValidationPipe(updateLineupSchema)) dto: UpdateLineupDto,
  ) {
    return this.updateLineupUseCase.execute({
      clubId: id,
      formation: dto.formation,
      playerIds: dto.player_ids,
    });
  }
}
