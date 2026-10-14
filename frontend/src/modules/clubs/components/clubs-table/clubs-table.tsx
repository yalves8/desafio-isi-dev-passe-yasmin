import { ChevronRight, Plus, Shield } from 'lucide-react'
import { Link } from 'react-router'
import { Tag } from '@/components/data-display/tag/tag'
import { ErrorState } from '@/components/feedback/states'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { INITIAL_CASH } from '../../clubs.constants'
import { ClubBadge } from '../club-badge/club-badge'
import { ClubsToolbar } from '../clubs-toolbar/clubs-toolbar'
import type { ClubsTableProps } from './clubs-table.types'

/** Larguras do Figma; o nome do clube ocupa o restante */
const COLUMNS = [
  { label: 'Clube' },
  { label: 'Sigla', width: 'w-[90px]' },
  { label: 'Caixa', numeric: true, width: 'w-[150px]' },
  { label: 'Valor do elenco', numeric: true, width: 'w-40' },
  { label: 'Patrimônio', numeric: true, width: 'w-40' },
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
  if (error) {
    return (
      <section aria-label="Lista de clubes" className="rounded-xl border bg-card p-4">
        <ErrorState message={error} onRetry={onRetry} />
      </section>
    )
  }

  if (!loading && clubs.length === 0) {
    return (
      <section
        aria-label="Lista de clubes"
        className="flex flex-col items-center gap-2 rounded-xl border bg-card px-6 py-12 text-center"
      >
        <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-muted">
          <Shield className="size-5 text-muted-foreground" aria-hidden />
        </span>
        <p className="font-semibold">Nenhum clube cadastrado</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Crie o primeiro clube com nome e sigla. Ele começa com {formatMoney(INITIAL_CASH)} em
          caixa e sem jogadores.
        </p>
        <Button
          variant="outline"
          size="md"
          className="mt-2"
          onClick={onCreate}
          disabled={!canCreate}
        >
          <Plus /> Novo clube
        </Button>
      </section>
    )
  }

  return (
    <section
      aria-label="Lista de clubes"
      className="overflow-hidden rounded-xl border bg-card shadow-2xs"
    >
      <ClubsToolbar total={clubs.length} sort={sort} onSortChange={onSortChange} />
      <Table aria-busy={loading}>
        <TableHeader className="bg-muted/60">
          <TableRow className="hover:bg-transparent">
            {COLUMNS.map((col) => (
              <TableHead
                key={col.label}
                className={cn(
                  'h-10 px-2 font-medium text-muted-foreground first:pl-4',
                  col.width,
                  col.numeric && 'text-right',
                )}
              >
                {col.label}
              </TableHead>
            ))}
            <TableHead className="w-[140px] pr-4">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={cn(loading && 'opacity-60 transition-opacity')}>
          {loading && clubs.length === 0
            ? Array.from({ length: 4 }, (_, i) => (
                <TableRow key={i} className="h-15">
                  <TableCell colSpan={COLUMNS.length + 1}>
                    <Skeleton className="h-7 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : clubs.map((club) => (
                <TableRow key={club.id} className="h-15">
                  <TableCell className="px-2 pl-4">
                    <span className="flex items-center gap-3 font-medium">
                      <ClubBadge acronym={club.acronym} />
                      {club.name}
                    </span>
                  </TableCell>
                  <TableCell className="px-2">
                    <Tag>{club.acronym}</Tag>
                  </TableCell>
                  <TableCell className="px-2 text-right tabular-nums">
                    {formatMoney(club.cash)}
                  </TableCell>
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
              ))}
        </TableBody>
      </Table>
    </section>
  )
}
