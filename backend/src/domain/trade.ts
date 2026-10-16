import { remainingDays } from '../common/utils/date.js';
import { Cents, roundDiv } from './money.js';

/** RN14: no máximo 12 jogadores por clube */
export const MAX_SQUAD_SIZE = 12;
/** Fim da fidelidade: até 1.095 dias depois da compra (Limites de cada campo) */
export const MAX_LOYALTY_DAYS = 1095;

const FEE_THRESHOLD: Cents = 3000;
const PENALTY_CAP: Cents = 1000;
const COMMISSION_BRACKET: Cents = 1000;

/** RN13: taxa de 5%, só quando o valor de mercado é maior que 30,00. */
export function purchaseFee(marketValue: Cents): Cents {
  return marketValue > FEE_THRESHOLD ? roundDiv(marketValue * 5, 100) : 0;
}

/** RN13: o custo total não pode passar de 50% do caixa (comparação exata, sem arredondar). */
export function isWithinCashLimit(totalCost: Cents, cash: Cents): boolean {
  return totalCost * 2 <= cash;
}

function penaltyPercent(daysLeft: number): number {
  if (daysLeft === 0) return 0;
  if (daysLeft <= 30) return 5;
  if (daysLeft <= 180) return 10;
  return 20;
}

export interface Penalty {
  daysRemaining: number;
  percent: number;
  amount: Cents;
}

/** RN15: multa por fidelidade, limitada a 10,00. */
export function loyaltyPenalty(
  marketValue: Cents,
  loyaltyUntil: Date,
  now: Date,
): Penalty {
  const daysRemaining = remainingDays(loyaltyUntil, now);
  const percent = penaltyPercent(daysRemaining);
  const amount = Math.min(roundDiv(marketValue * percent, 100), PENALTY_CAP);
  return { daysRemaining, percent, amount };
}

/** RN16: comissão progressiva sobre o lucro (10% até 10,00 e 20% sobre o excedente). */
export function saleCommission(profit: Cents): Cents {
  if (profit <= 0) return 0;
  const lowerBracket = Math.min(profit, COMMISSION_BRACKET);
  const upperBracket = profit - lowerBracket;
  return roundDiv(lowerBracket * 10 + upperBracket * 20, 100);
}

export type ContractEnd = 'RESCINDIDO' | 'ENCERRADO';

interface SaleSettlement {
  penalty: Penalty;
  profit: Cents;
  commission: Cents;
  credit: Cents;
  contractStatus: ContractEnd;
}

/**
 * RN15 e RN16: acerto da venda pelo valor de mercado do momento. Com multa o contrato é
 * rescindido; sem multa (fidelidade cumprida), encerrado.
 */
export function saleSettlement(
  marketValue: Cents,
  purchaseValue: Cents,
  loyaltyUntil: Date,
  now: Date,
): SaleSettlement {
  const penalty = loyaltyPenalty(marketValue, loyaltyUntil, now);
  const profit = marketValue - purchaseValue;
  const commission = saleCommission(profit);
  return {
    penalty,
    profit,
    commission,
    credit: marketValue - penalty.amount - commission,
    contractStatus: penalty.amount > 0 ? 'RESCINDIDO' : 'ENCERRADO',
  };
}
