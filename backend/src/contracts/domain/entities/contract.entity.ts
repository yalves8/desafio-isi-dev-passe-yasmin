import { toCents } from '../../../domain/money.js';
import { loyaltyPenalty, Penalty } from '../../../domain/trade.js';

/**
 * Entidade rica de domínio representando o Contrato de um jogador com um clube (DDD).
 *
 * Encapsula vigência, valor de aquisição e cálculo de multa rescisória (RN15).
 *
 * @export
 * @class ContractEntity
 */
export class ContractEntity {
  /**
   * Construtor da entidade `ContractEntity`.
   *
   * @param {number} id - Identificador único do contrato.
   * @param {number} playerId - Identificador do jogador contratado.
   * @param {number} clubId - Identificador do clube contratante.
   * @param {number} purchaseValue - Valor de aquisição do atleta na transação.
   * @param {Date} loyaltyUntil - Data limite do período de fidelidade.
   * @param {'ATIVO' | 'ENCERRADO'} [status='ATIVO'] - Situação do contrato.
   * @param {Date} [startedAt=new Date()] - Data de início do contrato.
   * @param {Date | null} [endedAt=null] - Data de encerramento, se finalizado.
   */
  constructor(
    public readonly id: number,
    public readonly playerId: number,
    public readonly clubId: number,
    public readonly purchaseValue: number,
    public readonly loyaltyUntil: Date,
    public readonly status: 'ATIVO' | 'ENCERRADO' = 'ATIVO',
    public readonly startedAt: Date = new Date(),
    public readonly endedAt: Date | null = null,
  ) {}

  /**
   * Calcula a multa rescisória e dias restantes de fidelidade (RN15).
   *
   * @param {number} marketValue - Valor de mercado atual do atleta em moedas.
   * @param {Date} [now=new Date()] - Data de referência do cálculo.
   * @returns {Penalty} Detalhes da multa calculada (dias restantes, percentual e valor em centavos).
   */
  public calculatePenalty(marketValue: number, now: Date = new Date()): Penalty {
    const mvCents = toCents(marketValue);
    return loyaltyPenalty(mvCents, this.loyaltyUntil, now);
  }
}
