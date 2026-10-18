import { describe, expect, it } from 'vitest';
import { Money } from './money.js';

describe('Money', () => {
  it('guarda centavos inteiros a partir do decimal das colunas ou de um número', () => {
    expect(Money.fromDecimal({ toString: () => '261.15' }).cents).toBe(26115);
    expect(Money.fromDecimal('8.7').cents).toBe(870);
    expect(Money.fromDecimal(300).cents).toBe(30000);
    expect(Money.fromDecimal(0.1).cents).toBe(10);
    expect(Money.ofCents(-3885).cents).toBe(-3885);
  });

  it('recusa centavos fracionados', () => {
    expect(() => Money.ofCents(10.5)).toThrow(RangeError);
  });

  it('soma e subtrai sem erro de ponto flutuante', () => {
    const a = Money.fromDecimal('0.1');
    const b = Money.fromDecimal('0.2');
    expect(a.plus(b).toNumber()).toBe(0.3);
    expect(b.minus(a).toNumber()).toBe(0.1);
    expect(Money.sum([a, b, a]).cents).toBe(40);
    expect(Money.sum([])).toEqual(Money.ZERO);
  });

  it('compara e converte para número em moedas só na borda', () => {
    const cash = Money.fromDecimal('261.15');
    expect(cash.toNumber()).toBe(261.15);
    expect(cash.compareTo(Money.ofCents(26116))).toBeLessThan(0);
    expect(cash.compareTo(Money.ofCents(26115))).toBe(0);
    expect(cash.equals(Money.ofCents(26115))).toBe(true);
    expect(cash.toDecimalString()).toBe('261.15');
    expect(Money.ofCents(-3885).toDecimalString()).toBe('-38.85');
  });
});
