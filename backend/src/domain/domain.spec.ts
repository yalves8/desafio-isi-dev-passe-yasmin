import { describe, expect, it } from 'vitest';
import { baseValue, overall } from './player-rating.js';
import { marketValue } from './market-value.js';
import { formatCents, roundDiv, toCents } from './money.js';
import { isWithinCashLimit, loyaltyPenalty, purchaseFee, saleCommission } from './trade.js';

describe('money', () => {
  it('arredonda o meio para longe do zero', () => {
    expect(roundDiv(14775, 10)).toBe(1478);
    expect(roundDiv(385, 10)).toBe(39);
    expect(roundDiv(-385, 10)).toBe(-39);
  });
  it('converte e formata centavos', () => {
    expect(toCents('40.00')).toBe(4000);
    expect(toCents('8.7')).toBe(870);
    expect(formatCents(-3885)).toBe('-38,85');
    expect(formatCents(400)).toBe('4,00');
  });
});

describe('marketValue (RN02 a RN05)', () => {
  it.each([
    [8200, 'APTO', 20, 25, 8200],
    [8200, 'APTO', 50, 19, 9020],
    [8200, 'MAL_CONDICIONADO', 50, 25, 6970],
    [8200, 'MAL_CONDICIONADO', 80, 21, 8405],
    [8200, 'MAL_CONDICIONADO', 30, 33, 5330],
    [8200, 'DOENTE', 90, 25, 6970],
    [8200, 'DOENTE', 30, 25, 4920],
    [8200, 'DOENTE', 10, 40, 4920],
    [950, 'MAL_CONDICIONADO', 85, 25, 879],
    [100, 'MAL_CONDICIONADO', 50, 35, 100],
  ] as const)('base %i %s agil %i idade %i => %i', (base, condition, agility, age, expected) => {
    expect(marketValue(base, condition, agility, age)).toBe(expected);
  });
});

describe('overall e valor base (RN06)', () => {
  it('calcula o overall pelos pesos da posição', () => {
    expect(overall('MEI', { pace: 68, shooting: 65, passing: 80, dribbling: 78, defending: 52, physical: 60 })).toBe(73);
    expect(overall('ZAG', { pace: 50, shooting: 90, passing: 60, dribbling: 40, defending: 80, physical: 75 })).toBe(73);
    expect(overall('GOL', { pace: 55, shooting: 30, passing: 65, dribbling: 40, defending: 72, physical: 68 })).toBe(68);
  });
  it.each([
    [75, 86, 25, 4000],
    [60, 70, 30, 1000],
    [61, 70, 30, 1200],
    [76, 80, 22, 4600],
    [85, 92, 27, 10000],
    [70, 84, 21, 3420],
    [70, 84, 22, 3000],
    [45, 90, 18, 363],
    [40, 66, 36, 100],
  ])('overall %i potencial %i idade %i => %i', (rating, potential, age, expected) => {
    expect(baseValue(rating, potential, age)).toBe(expected);
  });
});

describe('compra e venda (RN13, RN15, RN16)', () => {
  it('cobra a taxa só acima de 30,00', () => {
    expect(purchaseFee(2800)).toBe(0);
    expect(purchaseFee(3000)).toBe(0);
    expect(purchaseFee(3001)).toBe(150);
    expect(purchaseFee(4762)).toBe(238);
  });
  it('compara o custo com 50% do caixa sem arredondar', () => {
    expect(isWithinCashLimit(5000, 10000)).toBe(true);
    expect(isWithinCashLimit(5040, 10000)).toBe(false);
    expect(isWithinCashLimit(13058, 26115)).toBe(false);
  });
  it.each([
    [10 * 24 * 60 + 2 * 60, 11, 5],
    [30 * 24 * 60, 30, 5],
    [30 * 24 * 60 + 1, 31, 10],
    [180 * 24 * 60, 180, 10],
    [180 * 24 * 60 + 1, 181, 20],
  ])('multa com %i min restantes => %i dias, %i%%', (minutes, days, percent) => {
    const now = new Date('2026-11-05T12:00:00Z');
    const until = new Date(now.getTime() + minutes * 60_000);
    const penalty = loyaltyPenalty(30000, until, now);
    expect(penalty.daysRemaining).toBe(days);
    expect(penalty.percent).toBe(percent);
  });
  it('não cobra multa quando a fidelidade já passou', () => {
    const now = new Date('2026-11-05T12:00:00Z');
    const penalty = loyaltyPenalty(30000, new Date(now.getTime() - 1000), now);
    expect(penalty).toEqual({ daysRemaining: 0, percent: 0, amount: 0 });
  });
  it('limita a multa a 10,00', () => {
    const now = new Date('2026-11-05T12:00:00Z');
    const until = new Date(now.getTime() + 200 * 86_400_000);
    expect(loyaltyPenalty(7500, until, now).amount).toBe(1000);
  });
  it.each([
    [300, 30],
    [385, 39],
    [1000, 100],
    [1001, 100],
    [1500, 200],
    [-750, 0],
  ])('comissão do lucro %i => %i', (profit, expected) => {
    expect(saleCommission(profit)).toBe(expected);
  });
});
