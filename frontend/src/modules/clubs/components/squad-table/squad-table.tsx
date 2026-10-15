import { HandCoins, Shirt, Users } from 'lucide-react'
import { Link } from 'react-router'
import { DataTable } from '@/components/data-display/data-table/data-table'
import type { DataTableColumn } from '@/components/data-display/data-table/data-table.types'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatDate, formatInteger, formatMoney, formatTime } from '@/lib/format'
import { ConditionBadge, PlayerAvatar, PositionBadge } from '@/modules/players'
import { MAX_SQUAD } from '../../clubs.constants'
import { PenaltyRateTag } from '../penalty-rate-tag/penalty-rate-tag'
import type { SquadTableProps } from './squad-table.types'

const COLUMNS: DataTableColumn[] = [
  { label: 'Jogador' },
  { label: 'Posição' },
  { label: 'Overall', numeric: true },
  { label: 'Condição' },
  { label: 'Valor de mercado', numeric: true },
  { label: 'Valor de compra', numeric: true },
  { label: 'Fim da fidelidade' },
  { label: 'Dias restantes', numeric: true },
  { label: '% de multa' },
  { label: 'Ações', srOnly: true, className: 'w-px' },
]

/** Elenco na ordem da RN11, com o contrato calculado pela API para uma venda agora */
export function SquadTable({ players, onSell }: SquadTableProps) {
  return (
    <section aria-label="Elenco" className="overflow-hidden rounded-xl border bg-card">
      <DataTable
        columns={COLUMNS}
        headerCellClassName="px-1.5"
        rows={players}
        rowKey={(player) => player.id}
        empty={{
          icon: Shirt,
          title: 'Nenhum jogador no elenco',
          description: `Compre jogadores livres para montar o elenco. O limite é de ${MAX_SQUAD} jogadores, e o custo de cada compra não pode passar de 50% do caixa.`,
          action: (
            <Button variant="outline" size="md" asChild>
              <Link to="/jogadores?tab=free">
                <Users /> Ver jogadores livres
              </Link>
            </Button>
          ),
        }}
        toolbar={
          <div className="p-4">
            <h2 className="text-base font-semibold">Elenco</h2>
            <p className="text-xs text-muted-foreground">
              Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome. Contrato calculado para
              uma venda agora.
            </p>
          </div>
        }
        renderRow={(player) => {
          const contract = player.contract
          return (
            <TableRow className="h-15">
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
        }}
      />
    </section>
  )
}
