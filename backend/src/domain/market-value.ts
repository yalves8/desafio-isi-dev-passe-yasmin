import { Condition, CONDITION_RULES } from './condition.js';
import { Cents, roundDiv } from './money.js';

// Percentuais em décimos de ponto percentual (15% = 150) para manter tudo em inteiros.
const DISCOUNT_CAP = 400;
const MIN_MARKET_VALUE: Cents = 100;

function conditionDiscount(condition: Condition, agility: number): number {
  const base = CONDITION_RULES[condition].marketDiscount;
  if (condition === 'APTO') return 0; // RN03: a agilidade só age quando não está APTO
  if (agility >= 80) return base / 2;
  if (agility <= 30) return base + 100;
  return base;
}

function ageAdjustment(age: number): number {
  if (age <= 21) return 100;
  if (age >= 32) return -100;
  return 0;
}

/** RN05: valor de mercado a partir do valor base gravado, da condição, da agilidade e da idade atuais. */
export function marketValue(
  baseValue: Cents,
  condition: Condition,
  agility: number,
  age: number,
): Cents {
  const total = Math.max(
    ageAdjustment(age) - conditionDiscount(condition, agility),
    -DISCOUNT_CAP,
  );
  return Math.max(roundDiv(baseValue * (1000 + total), 1000), MIN_MARKET_VALUE);
}
