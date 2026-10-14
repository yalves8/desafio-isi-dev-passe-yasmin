import { remainingDays } from '../common/utils/date.js';
import { Cents, roundDiv } from './money.js';

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
