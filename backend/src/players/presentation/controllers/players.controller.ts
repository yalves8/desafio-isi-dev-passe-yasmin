import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ParseIdPipe } from '../../../common/pipes/parse-id.pipe.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { CreatePlayerUseCase } from '../../application/usecases/create-player/create-player.usecase.js';
import { DeletePlayerUseCase } from '../../application/usecases/delete-player/delete-player.usecase.js';
import { FindPlayerByIdUseCase } from '../../application/usecases/find-player-by-id/find-player-by-id.usecase.js';
import { FindPlayersUseCase } from '../../application/usecases/find-players/find-players.usecase.js';
import { UpdatePlayerConditionUseCase } from '../../application/usecases/update-player-condition/update-player-condition.usecase.js';
import { UpdatePlayerUseCase } from '../../application/usecases/update-player/update-player.usecase.js';
import type { CreatePlayerDto } from '../dtos/create-player.dto.js';
import { createPlayerSchema } from '../dtos/create-player.dto.js';
import { parseQueryPlayers } from '../dtos/query-players.dto.js';
import type { UpdateConditionDto } from '../dtos/update-condition.dto.js';
import { updateConditionSchema } from '../dtos/update-condition.dto.js';
import type { UpdatePlayerDto } from '../dtos/update-player.dto.js';
import { updatePlayerSchema } from '../dtos/update-player.dto.js';

/**
 * Controller responsável por expor os pontos de entrada HTTP para o gerenciamento de atletas.
 *
 * Atua na camada de apresentação (Clean Architecture), recebendo as requisições HTTP,
 * aplicando validações Zod e pipes, e delegando para os respectivos casos de uso.
 *
 * @export
 * @class PlayersController
 */
@Controller('players')
export class PlayersController {
  /**
   * Construtor do `PlayersController`.
   *
   * @param {CreatePlayerUseCase} createPlayerUseCase - Caso de uso de criação de jogador.
   * @param {FindPlayersUseCase} findPlayersUseCase - Caso de uso de listagem e busca paginada.
   * @param {FindPlayerByIdUseCase} findPlayerByIdUseCase - Caso de uso de consulta detalhada por id.
   * @param {UpdatePlayerUseCase} updatePlayerUseCase - Caso de uso de atualização cadastral.
   * @param {UpdatePlayerConditionUseCase} updatePlayerConditionUseCase - Caso de uso de alteração de condição física.
   * @param {DeletePlayerUseCase} deletePlayerUseCase - Caso de uso de exclusão lógica.
   */
  constructor(
    private readonly createPlayerUseCase: CreatePlayerUseCase,
    private readonly findPlayersUseCase: FindPlayersUseCase,
    private readonly findPlayerByIdUseCase: FindPlayerByIdUseCase,
    private readonly updatePlayerUseCase: UpdatePlayerUseCase,
    private readonly updatePlayerConditionUseCase: UpdatePlayerConditionUseCase,
    private readonly deletePlayerUseCase: DeletePlayerUseCase,
  ) {}

  /**
   * Cadastra um novo jogador na liga.
   *
   * @param {CreatePlayerDto} dto - Payload validado com atributos técnicos e dados do atleta.
   * @param {Response} res - Objeto Express Response para definir o header Location.
   * @returns {Promise<Response>} 201 Created com Location e o jogador cadastrado.
   */
  @Post()
  async create(
    @Body(new ZodValidationPipe(createPlayerSchema)) dto: CreatePlayerDto,
    @Res() res: Response,
  ) {
    const player = await this.createPlayerUseCase.execute(dto);
    res.setHeader('Location', `/api/v1/players/${player.id}`);
    return res.status(HttpStatus.CREATED).json(player);
  }

  /**
   * Lista jogadores de forma paginada com suporte a busca textual, filtros e ordenações (RN07).
   *
   * @param {Record<string, string | undefined>} query - Query params validados pelo parser.
   * @returns {Promise<any>} Objeto paginado com 'data' e 'meta'.
   */
  @Get()
  async findAll(@Query() query: Record<string, string | undefined>) {
    const parsedQuery = parseQueryPlayers(query);
    return this.findPlayersUseCase.execute(parsedQuery);
  }

  /**
   * Consulta os dados detalhados de um atleta pelo seu ID.
   *
   * @param {number} id - Identificador único validado pelo ParseIdPipe.
   * @returns {Promise<any>} Dados completos do atleta com overall e valor de mercado atualizados.
   */
  @Get(':id')
  async findById(@Param('id', ParseIdPipe) id: number) {
    return this.findPlayerByIdUseCase.execute({ id });
  }

  /**
   * Atualiza os dados cadastrais (nome, posição, agilidade e idade) do atleta (RN08).
   *
   * @param {number} id - Identificador do atleta.
   * @param {UpdatePlayerDto} dto - Dados a serem atualizados.
   * @returns {Promise<any>} Atleta atualizado.
   */
  @Put(':id')
  async update(
    @Param('id', ParseIdPipe) id: number,
    @Body(new ZodValidationPipe(updatePlayerSchema)) dto: UpdatePlayerDto,
  ) {
    return this.updatePlayerUseCase.execute({ id, ...dto });
  }

  /**
   * Altera a condição física do jogador ('APTO', 'MAL_CONDICIONADO' ou 'DOENTE') (RN19).
   *
   * @param {number} id - Identificador do atleta.
   * @param {UpdateConditionDto} dto - Nova condição física.
   * @returns {Promise<any>} Atleta atualizado.
   */
  @Patch(':id/condition')
  async updateCondition(
    @Param('id', ParseIdPipe) id: number,
    @Body(new ZodValidationPipe(updateConditionSchema)) dto: UpdateConditionDto,
  ) {
    return this.updatePlayerConditionUseCase.execute({
      id,
      condition: dto.condition,
    });
  }

  /**
   * Realiza a exclusão lógica de um jogador livre (RN09).
   *
   * @param {number} id - Identificador do atleta.
   * @returns {Promise<void>} 204 No Content.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIdPipe) id: number) {
    await this.deletePlayerUseCase.execute({ id });
  }
}
