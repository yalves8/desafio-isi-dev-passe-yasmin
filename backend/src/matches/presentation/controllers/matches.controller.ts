import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ParseIdPipe } from '../../../common/pipes/parse-id.pipe.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { FindMatchByIdUseCase } from '../../application/usecases/find-match-by-id/find-match-by-id.usecase.js';
import { FindMatchesUseCase } from '../../application/usecases/find-matches/find-matches.usecase.js';
import { PlayMatchUseCase } from '../../application/usecases/play-match/play-match.usecase.js';
import { parseMatchesQuery } from '../dtos/matches-query.dto.js';
import type { PlayMatchDto } from '../dtos/play-match.dto.js';
import { playMatchSchema } from '../dtos/play-match.dto.js';

/**
 * Controller das partidas: jogar, histórico e partida com os duelos (RN20 e RN21).
 *
 * @export
 * @class MatchesController
 */
@Controller('matches')
export class MatchesController {
  /**
   * Construtor do `MatchesController`.
   *
   * @param {PlayMatchUseCase} playMatchUseCase - Joga e grava a partida.
   * @param {FindMatchesUseCase} findMatchesUseCase - Histórico de partidas.
   * @param {FindMatchByIdUseCase} findMatchByIdUseCase - Partida com os duelos.
   */
  constructor(
    private readonly playMatchUseCase: PlayMatchUseCase,
    private readonly findMatchesUseCase: FindMatchesUseCase,
    private readonly findMatchByIdUseCase: FindMatchByIdUseCase,
  ) {}

  /**
   * Joga a partida na hora e grava o resultado.
   *
   * @param {PlayMatchDto} dto - Mandante e visitante.
   * @param {Response} res - Resposta Express, para o cabeçalho Location.
   * @returns {Promise<Response>} 201 com Location e a partida com os 6 duelos.
   */
  @Post()
  async play(
    @Body(new ZodValidationPipe(playMatchSchema)) dto: PlayMatchDto,
    @Res() res: Response,
  ) {
    const match = await this.playMatchUseCase.execute({
      homeClubId: dto.home_club_id,
      awayClubId: dto.away_club_id,
    });
    res.setHeader('Location', `/api/v1/matches/${match.id}`);
    return res.status(HttpStatus.CREATED).json(match);
  }

  /**
   * Histórico de partidas, da mais recente para a mais antiga; filtro `club_id`.
   *
   * @param {Record<string, unknown>} query - Filtros.
   * @returns {Promise<MatchOutput[]>} Partidas sem duelos.
   */
  @Get()
  async findAll(@Query() query: Record<string, unknown>) {
    return this.findMatchesUseCase.execute(parseMatchesQuery(query));
  }

  /**
   * Partida com os 6 duelos.
   *
   * @param {number} id - Partida da URL (inválido → 404).
   * @returns {Promise<MatchOutput>} Partida.
   */
  @Get(':id')
  async findById(@Param('id', ParseIdPipe) id: number) {
    return this.findMatchByIdUseCase.execute({ id });
  }
}
