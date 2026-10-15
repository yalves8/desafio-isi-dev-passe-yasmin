import { ChevronRight, Shield, Swords } from 'lucide-react'
import { Link } from 'react-router'
import { DataTable } from '@/components/data-display/data-table/data-table'
import type { DataTableColumn } from '@/components/data-display/data-table/data-table.types'
import { Tag } from '@/components/data-display/tag/tag'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatDate, formatTime, plural } from '@/lib/format'
import { cn } from '@/lib/utils'
import { RESULT_LABEL } from '../../league.constants'
import { scoreLabel, winnerSide } from '../../league.utils'
import type { MatchesTableProps } from './matches-table.types'

const COLUMNS: DataTableColumn[] = [
  { label: 'Data e hora', className: 'w-48' },
  { label: 'Mandante', className: 'text-right' },
  { label: 'Placar', className: 'w-24 text-center' },
  { label: 'Visitante' },
  { label: 'Resultado' },
  { label: 'Ações', srOnly: true, className: 'w-32' },
]

/** Histórico de partidas (Figma L01): da mais recente para a mais antiga, com filtro por clube */
export function MatchesTable({
  matches,
  clubsById,
  loading,
  error,
  onRetry,
  filter,
}: MatchesTableProps) {
  const acronym = (clubId: number) => clubsById.get(clubId)?.acronym ?? '—'
  const filterLabel =
    filter.clubId === undefined ? 'todos' : (clubsById.get(filter.clubId)?.name ?? 'todos')

  return (
    <section
      aria-labelledby="matches-title"
      className="overflow-hidden rounded-xl border bg-card shadow-2xs"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <div>
          <h2 id="matches-title" className="text-base font-semibold">
            Histórico de partidas
          </h2>
          <p className="text-xs text-muted-foreground">Da mais recente para a mais antiga.</p>
        </div>
        <Select
          value={filter.clubId === undefined ? 'ALL' : String(filter.clubId)}
          onValueChange={(value) => filter.onChange(value === 'ALL' ? undefined : Number(value))}
        >
          <SelectTrigger
            className="h-9 w-56 gap-2 pl-3 text-left text-muted-foreground *:data-[slot=select-value]:flex-1"
            aria-label="Filtrar por clube"
          >
            <Shield aria-hidden />
            <SelectValue>Clube: {filterLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os clubes</SelectItem>
            {filter.clubs.map((club) => (
              <SelectItem key={club.id} value={String(club.id)}>
                {club.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <DataTable
        columns={COLUMNS}
        rows={matches}
        rowKey={(match) => match.id}
        loading={loading}
        loadingLabel="Carregando partidas"
        skeletonRows={2}
        error={error}
        errorTitle="Não foi possível carregar as partidas"
        onRetry={onRetry}
        empty={
          filter.clubId === undefined
            ? {
                icon: Swords,
                title: 'Nenhuma partida ainda',
                description:
                  'Jogue a primeira partida entre dois clubes com os 5 titulares escalados.',
              }
            : {
                icon: Swords,
                title: 'Nenhuma partida desse clube',
                description: 'O clube ainda não jogou como mandante nem como visitante.',
              }
        }
        footer={
          <p className="border-t px-4 py-3 text-sm text-muted-foreground">
            {plural(matches.length, 'partida')}
          </p>
        }
        renderRow={(match) => {
          const winner = winnerSide(match)
          return (
            <TableRow className="h-14">
              <TableCell className="px-2 pl-4 tabular-nums">
                {formatDate(match.played_at)}{' '}
                <span className="ml-1 text-muted-foreground">{formatTime(match.played_at)}</span>
              </TableCell>
              <TableCell className="px-2 text-right">
                <span className="inline-flex items-center gap-2">
                  <span className={cn(winner === 'home' && 'font-semibold')}>
                    {match.home.club_name}
                  </span>
                  <Tag variant="muted">{acronym(match.home.club_id)}</Tag>
                </span>
              </TableCell>
              <TableCell className="px-2 text-center">
                <Tag className="font-semibold tabular-nums">{scoreLabel(match)}</Tag>
              </TableCell>
              <TableCell className="px-2">
                <span className="inline-flex items-center gap-2">
                  <Tag variant="muted">{acronym(match.away.club_id)}</Tag>
                  <span className={cn(winner === 'away' && 'font-semibold')}>
                    {match.away.club_name}
                  </span>
                </span>
              </TableCell>
              <TableCell className="px-2">
                <Tag>{RESULT_LABEL[match.result]}</Tag>
              </TableCell>
              <TableCell className="pr-4 pl-2 text-right">
                <Button variant="ghost" size="md" asChild className="px-3">
                  <Link
                    to={`/partidas/${match.id}`}
                    aria-label={`Ver duelos de ${match.home.club_name} ${scoreLabel(match)} ${match.away.club_name}`}
                  >
                    Ver duelos <ChevronRight />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          )
        }}
      />
    </section>
  )
}
