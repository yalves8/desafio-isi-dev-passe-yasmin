import { formatBrasiliaDateTime } from '../../../common/utils/date.js';
import { formatCents } from '../../../domain/money.js';
import { TransactionRecord } from '../../application/interfaces/repositories/transfer.repository.interface.js';

const HEADER =
  'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa';

/** Nome com `;` ou aspas vai entre aspas duplas, com as aspas internas duplicadas (RN18) */
function csvText(value: string): string {
  return /[;"]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

/**
 * Histórico em CSV (RN18): cabeçalho, uma linha por transação na ordem do histórico,
 * separador `;`, 2 casas com vírgula, lucro vazio quando nulo e toda linha terminada em LF.
 */
export function toTransactionsCsv(transactions: TransactionRecord[]): string {
  const lines = transactions.map((t) =>
    [
      formatBrasiliaDateTime(t.createdAt),
      t.type,
      csvText(t.playerName),
      formatCents(t.value),
      formatCents(t.fee),
      formatCents(t.penalty),
      t.profit === null ? '' : formatCents(t.profit),
      formatCents(t.cashChange),
    ].join(';'),
  );
  return [HEADER, ...lines].map((line) => `${line}\n`).join('');
}
