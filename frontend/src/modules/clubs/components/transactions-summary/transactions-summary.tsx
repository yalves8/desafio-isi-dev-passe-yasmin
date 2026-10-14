import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TransactionsSummaryProps } from './transactions-summary.types'

/** Totais das transações filtradas, como a API calcula (RN17) */
export function TransactionsSummary({ summary }: TransactionsSummaryProps) {
  const items = [
    { label: 'Total gasto', hint: 'Valor + taxa das compras', value: summary.total_spent },
    { label: 'Total recebido', hint: 'Crédito das vendas', value: summary.total_received },
    { label: 'Taxas e comissões', hint: 'Compras e vendas', value: summary.total_fees },
    { label: 'Multas', hint: 'Por fidelidade, nas vendas', value: summary.total_penalties },
    { label: 'Lucro', hint: 'Das vendas, com sinal', value: summary.total_profit, signed: true },
  ]
  return (
    <dl className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border p-4">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd
            className={cn(
              'text-lg font-semibold tabular-nums',
              item.signed && item.value > 0 && 'text-green-700',
              item.signed && item.value < 0 && 'text-red-600',
            )}
          >
            {item.signed && item.value > 0 ? '+' : ''}
            {formatMoney(item.value)}
          </dd>
          <dd className="text-xs text-muted-foreground">{item.hint}</dd>
        </div>
      ))}
    </dl>
  )
}
