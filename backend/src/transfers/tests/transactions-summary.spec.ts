import { describe, expect, it } from 'vitest';
import { summarizeTransactions } from '../domain/transactions-summary.js';

const purchase = {
  type: 'COMPRA' as const,
  value: 3700,
  fee: 185,
  penalty: 0,
  profit: null,
  cashChange: -3885,
};
const sale = {
  type: 'VENDA' as const,
  value: 4000,
  fee: 30,
  penalty: 400,
  profit: 300,
  cashChange: 3570,
};

describe('resumo do histórico (RN17, exemplo 2.3.3)', () => {
  it('soma compras e vendas sem filtro', () => {
    expect(summarizeTransactions([sale, purchase])).toEqual({
      spent: 3885,
      received: 3570,
      fees: 215,
      penalties: 400,
      profit: 300,
    });
  });

  it('com só vendas, total pago em compras é zero', () => {
    expect(summarizeTransactions([sale]).spent).toBe(0);
  });

  it('sem transações, tudo zero', () => {
    expect(summarizeTransactions([])).toEqual({
      spent: 0,
      received: 0,
      fees: 0,
      penalties: 0,
      profit: 0,
    });
  });
});
