import { HandCoins, ShoppingCart } from 'lucide-react'
import { Tag } from '@/components/data-display/tag/tag'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatMoney, formatSigned, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PlayerAvatar } from '@/modules/players'
import type { TransactionsTableProps } from './transactions-table.types'

/** Larguras do Figma (H01); o jogador ocupa o restante */
const COLUMNS = [
  { label: 'Data e hora', width: 'w-[150px]' },
  { label: 'Tipo', width: 'w-[100px]' },
  { label: 'Jogador' },
  { label: 'Valor', numeric: true, width: 'w-24' },
  { label: 'Taxa ou comissão', numeric: true, width: 'w-32' },
  { label: 'Multa', numeric: true, width: 'w-[84px]' },
  { label: 'Lucro', numeric: true, width: 'w-[88px]' },
  { label: 'Variação do caixa', numeric: true, width: 'w-[140px]' },
]

const toneOf = (value: number) =>
  value > 0 ? 'text-green-700' : value < 0 ? 'text-red-600' : 'text-muted-foreground'

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
                col.width,
                col.numeric && 'text-right',
              )}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => {
          const isPurchase = t.type === 'COMPRA'
          return (
            <TableRow key={t.id} className="h-13">
              <TableCell className="px-2 pl-4 tabular-nums">
                {formatDate(t.created_at)}{' '}
                <span className="ml-1 text-muted-foreground">{formatTime(t.created_at)}</span>
              </TableCell>
              <TableCell className="px-2">
                <Tag variant={isPurchase ? 'outline' : 'muted'}>
                  {isPurchase ? (
                    <ShoppingCart className="size-3" aria-hidden />
                  ) : (
                    <HandCoins className="size-3" aria-hidden />
                  )}
                  {isPurchase ? 'Compra' : 'Venda'}
                </Tag>
              </TableCell>
              <TableCell className="px-2">
                <span className="flex items-center gap-2.5 font-medium">
                  <PlayerAvatar id={t.player_id} name={t.player_name} />
                  {t.player_name}
                </span>
              </TableCell>
              <TableCell className="px-2 text-right tabular-nums">{formatMoney(t.value)}</TableCell>
              <TableCell className="px-2 text-right tabular-nums">{formatMoney(t.fee)}</TableCell>
              <TableCell
                className={cn(
                  'px-2 text-right tabular-nums',
                  t.penalty === 0 && 'text-muted-foreground',
                )}
              >
                {formatMoney(t.penalty)}
              </TableCell>
              <TableCell
                className={cn(
                  'px-2 text-right tabular-nums',
                  t.profit === null ? 'text-muted-foreground' : toneOf(t.profit),
                )}
              >
                {t.profit === null ? (
                  <span aria-label="sem lucro na compra">–</span>
                ) : (
                  formatSigned(t.profit)
                )}
              </TableCell>
              <TableCell
                className={cn(
                  'px-2 pr-4 text-right font-semibold tabular-nums',
                  toneOf(t.cash_change),
                )}
              >
                {formatSigned(t.cash_change)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
