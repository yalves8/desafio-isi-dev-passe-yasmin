import { Cents } from '../../domain/money.js';

/** O que o resumo usa de cada transação gravada */
interface SummarizedTransaction {
  type: 'COMPRA' | 'VENDA';
  value: Cents;
  fee: Cents;
  penalty: Cents;
  profit: Cents | null;
  cashChange: Cents;
}

export interface TransactionsSummary {
  spent: Cents;
  received: Cents;
  fees: Cents;
  penalties: Cents;
  profit: Cents;
}

/**
 * RN17: totais das transações filtradas. Compras somam valor + taxa; vendas somam o crédito
 * líquido, a multa e o lucro com sinal; taxas e comissões somam nas duas.
 */
export function summarizeTransactions(
  transactions: SummarizedTransaction[],
): TransactionsSummary {
  const summary: TransactionsSummary = {
    spent: 0,
    received: 0,
    fees: 0,
    penalties: 0,
    profit: 0,
  };
  for (const t of transactions) {
    summary.fees += t.fee;
    if (t.type === 'COMPRA') {
      summary.spent += t.value + t.fee;
    } else {
      summary.received += t.cashChange;
      summary.penalties += t.penalty;
      summary.profit += t.profit ?? 0;
    }
  }
  return summary;
}
