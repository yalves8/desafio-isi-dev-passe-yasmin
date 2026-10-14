import {
  ConflictError,
  NotFoundError,
} from '../../../../common/errors/domain.errors.js';
import { formatBrasiliaDateTime } from '../../../../common/utils/date.js';
import { fromCents, toCents } from '../../../../domain/money.js';
import { loyaltyPenalty, saleCommission } from '../../../../domain/trade.js';
import {
  ITransferRepository,
  SaleRecord,
  SaleState,
} from '../../interfaces/repositories/transfer.repository.interface.js';
import { SellPlayerInput } from './sell-player.input.js';
import { SellPlayerOutput } from './sell-player.output.js';

/**
 * Caso de uso responsável pela venda de um jogador pelo clube atual dele (RN15 e RN16).
 *
 * Regras aplicadas:
 * 1. O jogador precisa existir (404) e ter clube (409).
 * 2. Valor de venda = valor de mercado no momento.
 * 3. Multa pelos dias restantes de fidelidade (0%, 5%, 10% ou 20%), limitada a 10,00 (RN15).
 * 4. Lucro = valor de venda − valor de compra do contrato; comissão progressiva só com lucro (RN16).
 * 5. Crédito = valor − multa − comissão. Com multa, o contrato fica `RESCINDIDO`; sem, `ENCERRADO`.
 * 6. Numa única operação: credita o caixa, libera o jogador, encerra o contrato, tira o
 *    jogador da escalação (RN19) e grava a transação `VENDA`.
 *
 * @export
 * @class SellPlayerUseCase
 */
export class SellPlayerUseCase {
  /**
   * Construtor do `SellPlayerUseCase`.
   *
   * @param {ITransferRepository} transferRepository - Repositório de compra e venda.
   */
  constructor(private readonly transferRepository: ITransferRepository) {}

  /**
   * Executa a venda.
   *
   * @param {SellPlayerInput} input - Jogador da URL.
   * @param {Date} [now=new Date()] - Instante da venda (RN01: vale o relógio do servidor).
   * @returns {Promise<SellPlayerOutput>} Transação, cálculos da venda e novo caixa.
   * @throws {NotFoundError} Jogador inexistente ou excluído.
   * @throws {ConflictError} Jogador livre.
   */
  async execute(
    input: SellPlayerInput,
    now: Date = new Date(),
  ): Promise<SellPlayerOutput> {
    const { record, transactionId } = await this.transferRepository.sale(
      input.playerId,
      (state) => this.decide(state, now),
    );

    return {
      id: transactionId,
      club_id: record.clubId,
      player_id: record.playerId,
      player_name: record.playerName,
      type: 'VENDA',
      value: fromCents(record.value),
      fee: fromCents(record.commission),
      penalty: fromCents(record.penalty),
      profit: fromCents(record.profit),
      cash_change: fromCents(record.credit),
      created_at: formatBrasiliaDateTime(record.now),
      purchase_value: fromCents(record.purchaseValue),
      remaining_days: record.remainingDays,
      penalty_rate: record.penaltyRate,
      contract_status: record.contractStatus,
      club_cash: fromCents(record.newCash),
    };
  }

  /** Regras da venda sobre o estado travado; lançar aqui desfaz a transação */
  private decide({ player, club, contract }: SaleState, now: Date): SaleRecord {
    if (!player) throw new NotFoundError('Jogador não encontrado');

    const name = player.getName();
    if (player.isFree() || !club) {
      throw new ConflictError(
        `${name} está livre: só jogador de um clube pode ser vendido.`,
      );
    }
    // Toda compra cria o contrato ATIVO na mesma operação: sem ele, o dado está inconsistente
    if (!contract) {
      throw new Error(
        `Jogador ${player.id} está no clube ${club.id} sem contrato ativo`,
      );
    }

    const value = toCents(player.calculateMarketValue());
    const penalty = loyaltyPenalty(value, contract.loyaltyUntil, now);
    const profit = value - contract.purchaseValue;
    const commission = saleCommission(profit);
    const credit = value - penalty.amount - commission;

    return {
      playerId: player.id,
      playerName: name,
      clubId: club.id,
      contractId: contract.id,
      contractStatus: penalty.amount > 0 ? 'RESCINDIDO' : 'ENCERRADO',
      purchaseValue: contract.purchaseValue,
      value,
      penalty: penalty.amount,
      penaltyRate: penalty.percent,
      remainingDays: penalty.daysRemaining,
      profit,
      commission,
      credit,
      newCash: club.cash + credit,
      now,
    };
  }
}
