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
import { CreateClubUseCase } from '../../application/usecases/create-club/create-club.usecase.js';
import { FindClubByIdUseCase } from '../../application/usecases/find-club-by-id/find-club-by-id.usecase.js';
import { FindClubsUseCase } from '../../application/usecases/find-clubs/find-clubs.usecase.js';
import type { CreateClubDto } from '../dtos/create-club.dto.js';
import { createClubSchema } from '../dtos/create-club.dto.js';
import { parseQueryClubs } from '../dtos/query-clubs.dto.js';

/**
 * Controller responsável por expor os endpoints HTTP para o gerenciamento de clubes.
 *
 * Atua na camada de apresentação (Clean Architecture), recebendo as requisições HTTP,
 * aplicando os pipes de validação e delegando a execução para os respectivos casos de uso.
 *
 * @export
 * @class ClubsController
 */
@Controller('clubs')
export class ClubsController {
  /**
   * Construtor do `ClubsController`.
   *
   * @param {CreateClubUseCase} createClubUseCase - Caso de uso de criação de clube.
   * @param {FindClubsUseCase} findClubsUseCase - Caso de uso de listagem de clubes.
   * @param {FindClubByIdUseCase} findClubByIdUseCase - Caso de uso de consulta de clube por id.
   */
  constructor(
    private readonly createClubUseCase: CreateClubUseCase,
    private readonly findClubsUseCase: FindClubsUseCase,
    private readonly findClubByIdUseCase: FindClubByIdUseCase,
  ) {}

  /**
   * Endpoint para cadastrar um novo clube.
   *
   * @param {CreateClubDto} dto - Dados validados para criação do clube.
   * @param {Response} res - Objeto de resposta Express para emissão do cabeçalho Location.
   * @returns {Promise<Response>} Resposta HTTP 201 com os dados do clube criado.
   */
  @Post()
  async create(
    @Body(new ZodValidationPipe(createClubSchema)) dto: CreateClubDto,
    @Res() res: Response,
  ) {
    const club = await this.createClubUseCase.execute(dto);
    res.setHeader('Location', `/api/v1/clubs/${club.id}`);
    return res.status(HttpStatus.CREATED).json(club);
  }

  /**
   * Endpoint para listar todos os clubes participantes.
   *
   * @param {Record<string, string | undefined>} query - Parâmetros de consulta (ordenação por nome ou patrimônio).
   * @returns {Promise<any>} Lista dos clubes com seus respectivos patrimônios calculados.
   */
  @Get()
  async findAll(@Query() query: Record<string, string | undefined>) {
    const { sort } = parseQueryClubs(query);
    return this.findClubsUseCase.execute({ sort });
  }

  /**
   * Endpoint para consultar os detalhes de um clube e seu elenco ordenado.
   *
   * @param {number} id - Identificador do clube na URL validado pelo ParseIdPipe.
   * @returns {Promise<any>} Detalhes do clube e elenco completo.
   */
  @Get(':id')
  async findById(@Param('id', ParseIdPipe) id: number) {
    return this.findClubByIdUseCase.execute({ id });
  }
}
