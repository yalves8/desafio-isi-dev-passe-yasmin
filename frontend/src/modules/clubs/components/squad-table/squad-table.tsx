import { HandCoins, Shirt, Users } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatInteger, formatMoney, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ConditionBadge, PlayerAvatar, PositionBadge } from '@/modules/players'
import { MAX_SQUAD } from '../../clubs.constants'
import { PenaltyRateTag } from '../penalty-rate-tag/penalty-rate-tag'
import type { SquadTableProps } from './squad-table.types'

const COLUMNS = [
  { label: 'Jogador' },
  { label: 'Posição' },
  { label: 'Overall', numeric: true },
  { label: 'Condição' },
  { label: 'Valor de mercado', numeric: true },
  { label: 'Valor de compra', numeric: true },
  { label: 'Fim da fidelidade' },
  { label: 'Dias restantes', numeric: true },
  { label: '% de multa' },
]

/** Elenco na ordem da RN11, com o contrato calculado pela API para uma venda agora */
export function SquadTable({ players, onSell }: SquadTableProps) {
  if (players.length === 0) {
    return (
      <section
        aria-label="Elenco"
        className="flex flex-col items-center gap-2 rounded-xl border bg-card px-6 py-12 text-center"
      >
        <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-muted">
          <Shirt className="size-5 text-muted-foreground" aria-hidden />
        </span>
        <p className="font-semibold">Nenhum jogador no elenco</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Compre jogadores livres para montar o elenco. O limite é de {MAX_SQUAD} jogadores, e o
          custo de cada compra não pode passar de 50% do caixa.
        </p>
        <Button variant="outline" size="md" className="mt-2" asChild>
          <Link to="/jogadores?tab=free">
            <Users /> Ver jogadores livres
          </Link>
        </Button>
      </section>
    )
  }

  return (
    <section aria-labelledby="squad-title" className="overflow-hidden rounded-xl border bg-card">
      <div className="p-4">
        <h2 id="squad-title" className="text-base font-semibold">
          Elenco
        </h2>
        <p className="text-xs text-muted-foreground">
          Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome. Contrato calculado para uma
          venda agora.
        </p>
      </div>
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow className="hover:bg-transparent">
            {COLUMNS.map((col) => (
              <TableHead
                key={col.label}
                className={cn(
                  'h-10 px-1.5 font-medium text-muted-foreground first:pl-4',
                  col.numeric && 'text-right',
                )}
              >
                {col.label}
              </TableHead>
            ))}
            <TableHead className="w-px pr-4">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const contract = player.contract
            return (
              <TableRow key={player.id} className="h-15">
                <TableCell className="px-1.5 pl-4">
                  <span className="flex items-center gap-3 font-medium">
                    <PlayerAvatar id={player.id} name={player.name} />
                    {player.name}
                  </span>
                </TableCell>
                <TableCell className="px-1.5">
                  <PositionBadge position={player.position} />
                </TableCell>
                <TableCell className="px-1.5 text-right font-semibold tabular-nums">
                  {player.overall}
                </TableCell>
                <TableCell className="px-1.5">
                  <ConditionBadge condition={player.condition} />
                </TableCell>
                <TableCell className="px-1.5 text-right font-semibold tabular-nums">
                  {formatMoney(player.market_value)}
                </TableCell>
                <TableCell className="px-1.5 text-right text-muted-foreground tabular-nums">
                  {contract ? formatMoney(contract.purchase_value) : '—'}
                </TableCell>
                <TableCell className="px-1.5">
                  {contract ? (
                    <span className="flex flex-col leading-tight">
                      <span className="tabular-nums">{formatDate(contract.loyalty_until)}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatTime(contract.loyalty_until)}
                      </span>
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="px-1.5 text-right tabular-nums">
                  {contract ? formatInteger(contract.remaining_days) : '—'}
                </TableCell>
                <TableCell className="px-1.5">
                  {contract ? <PenaltyRateTag rate={contract.penalty_rate} /> : '—'}
                </TableCell>
                <TableCell className="pr-4 pl-1.5">
                  <Button
                    variant="outline"
                    size="md"
                    className="px-2.5"
                    onClick={() => onSell(player)}
                    aria-label={`Vender ${player.name}`}
                  >
                    <HandCoins /> Vender
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </section>
  )
}
