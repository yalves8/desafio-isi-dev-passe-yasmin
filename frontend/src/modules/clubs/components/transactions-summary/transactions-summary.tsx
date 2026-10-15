import {
  BadgePercent,
  HandCoins,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react'
import { formatMoney, formatSigned } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TransactionsSummaryProps } from './transactions-summary.types'

/** Totais das transações filtradas, como a API calcula (RN17), no rodapé do histórico */
export function TransactionsSummary({ summary }: TransactionsSummaryProps) {
  const profit = summary.total_profit
  const items = [
    {
      label: 'Total pago em compras',
      hint: 'Valor + taxa',
      icon: ShoppingCart,
      value: formatMoney(summary.total_spent),
    },
    {
      label: 'Total recebido em vendas',
      hint: 'Crédito líquido',
      icon: HandCoins,
      value: formatMoney(summary.total_received),
    },
    {
      label: 'Taxas e comissões',
      hint: 'Somadas',
      icon: BadgePercent,
      value: formatMoney(summary.total_fees),
    },
    {
      label: 'Multas',
      hint: 'Por fidelidade',
      icon: TriangleAlert,
      value: formatMoney(summary.total_penalties),
    },
    {
      label: 'Lucro total',
      hint: 'Soma dos lucros, com sinal',
      icon: profit < 0 ? TrendingDown : TrendingUp,
      value: formatSigned(profit),
      tone: profit > 0 ? 'text-green-700' : profit < 0 ? 'text-red-600' : undefined,
    },
  ]
  return (
    <dl
      aria-label="Totais das transações filtradas"
      className="grid border-t bg-muted/40 sm:grid-cols-3 xl:grid-cols-5"
    >
      {items.map(({ label, hint, icon: Icon, value, tone }) => (
        <div
          key={label}
          className="flex flex-col gap-1 border-b px-4 py-3.5 sm:border-r xl:border-b-0 xl:last:border-r-0"
        >
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Icon className="size-3.5" aria-hidden />
            {label}
          </dt>
          <dd className={cn('text-base font-semibold tabular-nums', tone)}>{value}</dd>
          <dd className="text-xs text-muted-foreground">{hint}</dd>
        </div>
      ))}
    </dl>
  )
}
