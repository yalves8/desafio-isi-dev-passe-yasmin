import { ChevronRight, Shield, Swords } from 'lucide-react'
import { Link } from 'react-router'
import { Tag } from '@/components/data-display/tag/tag'
import { ErrorState } from '@/components/feedback/states'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatTime, plural } from '@/lib/format'
import { cn } from '@/lib/utils'
import { RESULT_LABEL } from '../../league.constants'
import { scoreLabel, winnerSide } from '../../league.utils'
import type { MatchesTableProps } from './matches-table.types'

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

      {error ? (
        <div className="border-t p-4">
          <ErrorState
            title="Não foi possível carregar as partidas"
            message={error}
            onRetry={onRetry}
          />
        </div>
      ) : loading && matches.length === 0 ? (
        <div
          role="status"
          aria-label="Carregando partidas"
          className="flex flex-col gap-2 border-t p-4"
        >
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center gap-2 border-t px-6 py-12 text-center">
          <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-muted">
            <Swords className="size-5 text-muted-foreground" aria-hidden />
          </span>
          <p className="font-semibold">
            {filter.clubId === undefined ? 'Nenhuma partida ainda' : 'Nenhuma partida desse clube'}
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            {filter.clubId === undefined
              ? 'Jogue a primeira partida entre dois clubes com os 5 titulares escalados.'
              : 'O clube ainda não jogou como mandante nem como visitante.'}
          </p>
        </div>
      ) : (
        <>
          <Table aria-busy={loading}>
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 w-48 px-2 pl-4 font-medium text-muted-foreground">
                  Data e hora
                </TableHead>
                <TableHead className="h-10 px-2 text-right font-medium text-muted-foreground">
                  Mandante
                </TableHead>
                <TableHead className="h-10 w-24 px-2 text-center font-medium text-muted-foreground">
                  Placar
                </TableHead>
                <TableHead className="h-10 px-2 font-medium text-muted-foreground">
                  Visitante
                </TableHead>
                <TableHead className="h-10 px-2 font-medium text-muted-foreground">
                  Resultado
                </TableHead>
                <TableHead className="h-10 w-32 pr-4">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => {
                const winner = winnerSide(match)
                return (
                  <TableRow key={match.id} className="h-14">
                    <TableCell className="px-2 pl-4 tabular-nums">
                      {formatDate(match.played_at)}{' '}
                      <span className="ml-1 text-muted-foreground">
                        {formatTime(match.played_at)}
                      </span>
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
              })}
            </TableBody>
          </Table>
          <p className="border-t px-4 py-3 text-sm text-muted-foreground">
            {plural(matches.length, 'partida')}
          </p>
        </>
      )}
    </section>
  )
}
