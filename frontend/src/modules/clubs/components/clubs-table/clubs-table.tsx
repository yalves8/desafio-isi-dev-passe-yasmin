import { ChevronRight, Plus, Shield } from 'lucide-react'
import { Link } from 'react-router'
import { DataTable } from '@/components/data-display/data-table/data-table'
import type { DataTableColumn } from '@/components/data-display/data-table/data-table.types'
import { Tag } from '@/components/data-display/tag/tag'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatMoney } from '@/lib/format'
import { INITIAL_CASH } from '../../clubs.constants'
import { ClubBadge } from '../club-badge/club-badge'
import { ClubsToolbar } from '../clubs-toolbar/clubs-toolbar'
import type { ClubsTableProps } from './clubs-table.types'

/** Larguras do Figma; o nome do clube ocupa o restante */
const COLUMNS: DataTableColumn[] = [
  { label: 'Clube' },
  { label: 'Sigla', className: 'w-[90px]' },
  { label: 'Caixa', numeric: true, className: 'w-[150px]' },
  { label: 'Valor do elenco', numeric: true, className: 'w-40' },
  { label: 'Patrimônio', numeric: true, className: 'w-40' },
  { label: 'Ações', srOnly: true, className: 'w-[140px]' },
]

/** Lista de clubes com os estados de carregando, vazio e erro */
export function ClubsTable({
  clubs,
  loading,
  error,
  onRetry,
  onCreate,
  canCreate,
  sort,
  onSortChange,
}: ClubsTableProps) {
  return (
    <section
      aria-label="Lista de clubes"
      className="overflow-hidden rounded-xl border bg-card shadow-2xs"
    >
      <DataTable
        columns={COLUMNS}
        rows={clubs}
        rowKey={(club) => club.id}
        loading={loading}
        skeletonRowClassName="h-15"
        error={error}
        errorTitle="Não foi possível carregar os clubes"
        onRetry={onRetry}
        empty={{
          icon: Shield,
          title: 'Nenhum clube cadastrado',
          description: `Crie o primeiro clube com nome e sigla. Ele começa com ${formatMoney(INITIAL_CASH)} em caixa e sem jogadores.`,
          action: (
            <Button variant="outline" size="md" onClick={onCreate} disabled={!canCreate}>
              <Plus /> Novo clube
            </Button>
          ),
        }}
        toolbar={<ClubsToolbar total={clubs.length} sort={sort} onSortChange={onSortChange} />}
        renderRow={(club) => (
          <TableRow className="h-15">
            <TableCell className="px-2 pl-4">
              <span className="flex items-center gap-3 font-medium">
                <ClubBadge acronym={club.acronym} />
                {club.name}
              </span>
            </TableCell>
            <TableCell className="px-2">
              <Tag>{club.acronym}</Tag>
            </TableCell>
            <TableCell className="px-2 text-right tabular-nums">{formatMoney(club.cash)}</TableCell>
            <TableCell className="px-2 text-right tabular-nums">
              {formatMoney(club.squad_value)}
            </TableCell>
            <TableCell className="px-2 text-right font-semibold tabular-nums">
              {formatMoney(club.net_worth)}
            </TableCell>
            <TableCell className="pr-4 pl-2 text-right">
              <Button variant="ghost" size="md" asChild className="px-3">
                <Link to={`/clubes/${club.id}`} aria-label={`Ver clube ${club.name}`}>
                  Ver clube <ChevronRight />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        )}
      />
    </section>
  )
}
