import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ParseIdPipe } from '../../../common/pipes/parse-id.pipe.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { BuyPlayerUseCase } from '../../application/usecases/buy-player/buy-player.usecase.js';
import { SellPlayerUseCase } from '../../application/usecases/sell-player/sell-player.usecase.js';
import type { BuyPlayerDto } from '../dtos/buy-player.dto.js';
import { buyPlayerSchema } from '../dtos/buy-player.dto.js';
import {
  toPurchaseResponse,
  toSaleResponse,
} from '../presenters/transaction.presenter.js';
import {
  PurchaseResponse,
  SaleResponse,
} from '../responses/transaction.response.js';

/**
 * Controller das operações de mercado sobre um jogador (compra e venda).
 *
 * Fica sob `/players/{id}`, como no enunciado, mas separado do cadastro de jogadores:
 * compra e venda mexem em clube, contrato e histórico ao mesmo tempo.
 *
 * @export
 * @class TransfersController
 */
@Controller('players')
export class TransfersController {
  /**
   * Construtor do `TransfersController`.
   *
   * @param {BuyPlayerUseCase} buyPlayerUseCase - Caso de uso de compra.
   * @param {SellPlayerUseCase} sellPlayerUseCase - Caso de uso de venda.
   */
  constructor(
    private readonly buyPlayerUseCase: BuyPlayerUseCase,
    private readonly sellPlayerUseCase: SellPlayerUseCase,
  ) {}

  /**
   * Compra um jogador livre e cria o contrato de fidelidade (RN12 a RN14).
   *
   * @param {number} id - Jogador da URL, validado pelo ParseIdPipe (inválido → 404).
   * @param {BuyPlayerDto} dto - Clube comprador e fim da fidelidade.
   * @returns {Promise<PurchaseResponse>} 200 com a transação, o contrato e o novo caixa.
   */
  @Post(':id/buy')
  @HttpCode(HttpStatus.OK)
  async buy(
    @Param('id', ParseIdPipe) id: number,
    @Body(new ZodValidationPipe(buyPlayerSchema)) dto: BuyPlayerDto,
  ): Promise<PurchaseResponse> {
    return toPurchaseResponse(
      await this.buyPlayerUseCase.execute({
        playerId: id,
        clubId: dto.club_id,
        loyaltyUntil: dto.loyalty_until,
      }),
    );
  }

  /**
   * Vende o jogador pelo clube atual dele (RN15 e RN16). A venda não tem corpo: um corpo
   * enviado é ignorado (V1).
   *
   * @param {number} id - Jogador da URL, validado pelo ParseIdPipe (inválido → 404).
   * @returns {Promise<SaleResponse>} 200 com a transação, os cálculos e o novo caixa.
   */
  @Post(':id/sell')
  @HttpCode(HttpStatus.OK)
  async sell(@Param('id', ParseIdPipe) id: number): Promise<SaleResponse> {
    return toSaleResponse(
      await this.sellPlayerUseCase.execute({ playerId: id }),
    );
  }
}
