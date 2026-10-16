import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ParseIdPipe } from '../../../common/pipes/parse-id.pipe.js';
import { ParseQueryPipe } from '../../../common/pipes/parse-query.pipe.js';
import { ExportClubTransactionsUseCase } from '../../application/usecases/export-club-transactions/export-club-transactions.usecase.js';
import { FindClubTransactionsUseCase } from '../../application/usecases/find-club-transactions/find-club-transactions.usecase.js';
import { parseTransactionFilters } from '../dtos/transaction-filters.dto.js';
import { toTransactionsPageResponse } from '../presenters/transaction.presenter.js';
import { toTransactionsCsv } from '../presenters/transactions-csv.presenter.js';
import { TransactionsPageResponse } from '../responses/transaction.response.js';

/**
 * Controller do histórico de transações do clube e da exportação CSV (RN17 e RN18).
 *
 * Fica sob `/clubs/{id}`, como no enunciado; as transações são gravadas pela compra e
 * pela venda deste mesmo módulo.
 *
 * @export
 * @class ClubTransactionsController
 */
@Controller('clubs')
export class ClubTransactionsController {
  /**
   * Construtor do `ClubTransactionsController`.
   *
   * @param {FindClubTransactionsUseCase} findClubTransactionsUseCase - Histórico com totais.
   * @param {ExportClubTransactionsUseCase} exportClubTransactionsUseCase - Exportação CSV.
   */
  constructor(
    private readonly findClubTransactionsUseCase: FindClubTransactionsUseCase,
    private readonly exportClubTransactionsUseCase: ExportClubTransactionsUseCase,
  ) {}

  /**
   * Histórico do clube com `summary`; filtros `type` e `player_id` (RN17).
   *
   * @param {number} id - Clube da URL (inválido → 404).
   * @param filters - Filtros validados (`type` e `player_id`).
   * @returns {Promise<TransactionsPageResponse>} `data` e `summary`.
   */
  @Get(':id/transactions')
  async find(
    @Param('id', ParseIdPipe) id: number,
    @Query(new ParseQueryPipe(parseTransactionFilters))
    filters: ReturnType<typeof parseTransactionFilters>,
  ): Promise<TransactionsPageResponse> {
    return toTransactionsPageResponse(
      await this.findClubTransactionsUseCase.execute({
        clubId: id,
        ...filters,
      }),
    );
  }

  /**
   * Histórico em CSV, com os mesmos filtros (RN18). Os erros continuam em JSON.
   *
   * @param {number} id - Clube da URL (inválido → 404).
   * @param filters - Filtros validados (`type` e `player_id`).
   * @param {Response} res - Resposta Express, para o corpo em texto.
   * @returns {Promise<void>} 200 com `text/csv`.
   */
  @Get(':id/transactions/export')
  async export(
    @Param('id', ParseIdPipe) id: number,
    @Query(new ParseQueryPipe(parseTransactionFilters))
    filters: ReturnType<typeof parseTransactionFilters>,
    @Res() res: Response,
  ) {
    const transactions = await this.exportClubTransactionsUseCase.execute({
      clubId: id,
      ...filters,
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="historico-clube-${id}.csv"`,
    );
    res.send(toTransactionsCsv(transactions));
  }
}
