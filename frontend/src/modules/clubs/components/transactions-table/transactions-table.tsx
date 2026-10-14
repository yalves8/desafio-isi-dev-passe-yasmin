import { Tag } from '@/components/data-display/tag/tag'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatMoney, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TransactionsTableProps } from './transactions-table.types'

const COLUMNS = [
  { label: 'Data e hora' },
  { label: 'Tipo' },
  { label: 'Jogador' },
  { label: 'Valor', numeric: true },
  { label: 'Taxa ou comissão', numeric: true },
  { label: 'Multa', numeric: true },
  { label: 'Lucro', numeric: true },
  { label: 'Variação do caixa', numeric: true },
]

const signed = (value: number) => `${value > 0 ? '+' : ''}${formatMoney(value)}`

/** Transações gravadas, da mais recente para a mais antiga; nada é recalculado (RN17) */
export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <Table>
      <TableHeader className="bg-muted/60">
        <TableRow className="hover:bg-transparent">
          {COLUMNS.map((col) => (
            <TableHead
              key={col.label}
              className={cn(
                'h-10 px-2 font-medium text-muted-foreground first:pl-4 last:pr-4',
                col.numeric && 'text-right',
              )}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => (
          <TableRow key={t.id} className="h-14">
            <TableCell className="px-2 pl-4">
              <span className="flex flex-col leading-tight tabular-nums">
                {formatDate(t.created_at)}
                <span className="text-xs text-muted-foreground">{formatTime(t.created_at)}</span>
              </span>
            </TableCell>
            <TableCell className="px-2">
              <Tag variant={t.type === 'COMPRA' ? 'muted' : 'outline'}>
                {t.type === 'COMPRA' ? 'Compra' : 'Venda'}
              </Tag>
            </TableCell>
            <TableCell className="px-2 font-medium">{t.player_name}</TableCell>
            <TableCell className="px-2 text-right tabular-nums">{formatMoney(t.value)}</TableCell>
            <TableCell className="px-2 text-right tabular-nums">{formatMoney(t.fee)}</TableCell>
            <TableCell className="px-2 text-right tabular-nums">{formatMoney(t.penalty)}</TableCell>
            <TableCell className="px-2 text-right tabular-nums">
              {t.profit === null ? '—' : signed(t.profit)}
            </TableCell>
            <TableCell
              className={cn(
                'px-2 pr-4 text-right font-semibold tabular-nums',
                t.cash_change > 0 ? 'text-green-700' : 'text-red-600',
              )}
            >
              {signed(t.cash_change)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
