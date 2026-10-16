import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../../common/errors/domain.errors.js';
import { addDays } from '../../../../common/utils/date.js';
import {
  formatCents,
  formatHalfCents,
  toCents,
} from '../../../../domain/money.js';
import {
  isWithinCashLimit,
  MAX_LOYALTY_DAYS,
  MAX_SQUAD_SIZE,
  purchaseFee,
} from '../../../../domain/trade.js';
import {
  ITransferRepository,
  PurchaseRecord,
  PurchaseState,
} from '../../interfaces/repositories/transfer.repository.interface.js';
import { toPurchaseOutput } from '../../presenters/transaction.presenter.js';
import { BuyPlayerInput } from './buy-player.input.js';
import { BuyPlayerOutput } from './buy-player.output.js';

/**
 * Caso de uso responsável pela compra de um jogador livre por um clube (RN12 a RN14).
 *
 * Regras aplicadas:
 * 1. O fim da fidelidade é depois do momento da compra e até 1.095 dias depois dele (400).
 * 2. Jogador e clube precisam existir (404); o jogador precisa estar livre (409).
 * 3. O clube não recompra jogador que ele mesmo vendeu (409) e tem no máximo 12 jogadores (409).
 * 4. Preço = valor de mercado no momento; taxa de 5% acima de 30,00; custo até 50% do caixa (409).
 * 5. Numa única operação: desconta o caixa, coloca o jogador no elenco, cria o contrato
 *    `ATIVO` e grava a transação `COMPRA`.
 *
 * @export
 * @class BuyPlayerUseCase
 */
export class BuyPlayerUseCase {
  /**
   * Construtor do `BuyPlayerUseCase`.
   *
   * @param {ITransferRepository} transferRepository - Repositório de compra e venda.
   */
  constructor(private readonly transferRepository: ITransferRepository) {}

  /**
   * Executa a compra.
   *
   * @param {BuyPlayerInput} input - Jogador, clube comprador e fim da fidelidade.
   * @param {Date} [now=new Date()] - Instante da compra (RN01: vale o relógio do servidor).
   * @returns {Promise<BuyPlayerOutput>} Transação, contrato criado e novo caixa.
   * @throws {ValidationError} Fim da fidelidade fora da janela permitida.
   * @throws {NotFoundError} Jogador ou clube inexistente.
   * @throws {ConflictError} Jogador com clube, recompra, elenco cheio ou custo acima do limite.
   */
  async execute(
    input: BuyPlayerInput,
    now: Date = new Date(),
  ): Promise<BuyPlayerOutput> {
    if (input.loyaltyUntil.getTime() <= now.getTime()) {
      throw new ValidationError(
        'O fim da fidelidade precisa ser depois do momento da compra',
      );
    }
    if (
      input.loyaltyUntil.getTime() > addDays(now, MAX_LOYALTY_DAYS).getTime()
    ) {
      throw new ValidationError(
        `O fim da fidelidade pode ser no máximo ${MAX_LOYALTY_DAYS.toLocaleString('pt-BR')} dias depois da compra`,
      );
    }

    const { record, transactionId } = await this.transferRepository.purchase(
      input.playerId,
      input.clubId,
      (state) => this.decide(state, input, now),
    );
    return toPurchaseOutput(transactionId, record);
  }

  /** Regras da compra sobre o estado travado; lançar aqui desfaz a transação */
  private decide(
    { player, club, squadSize, soldBefore }: PurchaseState,
    input: BuyPlayerInput,
    now: Date,
  ): PurchaseRecord {
    if (!player) throw new NotFoundError('Jogador não encontrado');
    if (!club) throw new NotFoundError('Clube não encontrado');

    const name = player.getName();
    if (!player.isFree()) {
      throw new ConflictError(
        `${name} não está livre: já pertence a um clube.`,
      );
    }
    if (soldBefore) {
      throw new ConflictError(
        `O ${club.name} já vendeu o ${name} e não pode comprá-lo de novo.`,
      );
    }
    if (squadSize >= MAX_SQUAD_SIZE) {
      throw new ConflictError(
        `O elenco do ${club.name} já tem ${MAX_SQUAD_SIZE} jogadores, o limite da liga.`,
      );
    }

    const value = toCents(player.calculateMarketValue());
    const fee = purchaseFee(value);
    const cost = value + fee;
    if (!isWithinCashLimit(cost, club.cash)) {
      throw new ConflictError(
        `O custo da compra (${formatCents(cost)}) passa do limite de 50% do caixa (${formatHalfCents(club.cash)}).`,
      );
    }

    return {
      playerId: player.id,
      playerName: name,
      clubId: club.id,
      value,
      fee,
      newCash: club.cash - cost,
      loyaltyUntil: input.loyaltyUntil,
      now,
    };
  }
}
