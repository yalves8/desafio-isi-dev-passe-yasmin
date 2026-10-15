import { Link } from 'react-router'
import { Tag } from '@/components/data-display/tag/tag'
import { ListOrdered } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/feedback/states'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { StandingsTableProps } from './standings-table.types'

const COLUMNS = [
  { key: 'played', label: 'J', title: 'Jogos' },
  { key: 'wins', label: 'V', title: 'Vitórias' },
  { key: 'draws', label: 'E', title: 'Empates' },
  { key: 'losses', label: 'D', title: 'Derrotas' },
  { key: 'goals_for', label: 'GP', title: 'Gols marcados' },
  { key: 'goals_against', label: 'GC', title: 'Gols sofridos' },
  { key: 'goal_difference', label: 'SG', title: 'Saldo de gols' },
  { key: 'points', label: 'Pts', title: 'Pontos' },
] as const

const signedInt = (value: number) => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : '0')

/** Classificação (Figma L05) na ordem devolvida por GET /standings; nada é recalculado (RN21) */
export function StandingsTable({
  standings,
  clubsById,
  loading,
  error,
  onRetry,
}: StandingsTableProps) {
  return (
    <section
      aria-label="Classificação"
      className="overflow-hidden rounded-xl border bg-card shadow-2xs"
    >
      {error ? (
        <ErrorState
          title="Não foi possível carregar a classificação"
          message={error}
          onRetry={onRetry}
        />
      ) : loading && standings.length === 0 ? (
        <div
          role="status"
          aria-label="Carregando classificação"
          className="flex flex-col gap-2 p-4"
        >
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : standings.length === 0 ? (
        <EmptyState
          icon={ListOrdered}
          title="Nenhum clube cadastrado"
          description="A classificação mostra todos os clubes, mesmo os que ainda não jogaram."
        />
      ) : (
        <>
          <Table aria-busy={loading}>
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 w-14 pl-4 text-center font-medium text-muted-foreground">
                  #
                </TableHead>
                <TableHead className="h-10 px-2 font-medium text-muted-foreground">Clube</TableHead>
                {COLUMNS.map((col) => (
                  <TableHead
                    key={col.key}
                    title={col.title}
                    className="h-10 w-12 px-2 text-right font-medium text-muted-foreground last:pr-4"
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((row) => (
                <TableRow key={row.club_id} className="h-13">
                  <TableCell className="pl-4 text-center">
                    <span
                      className={cn(
                        'inline-flex size-6 items-center justify-center rounded-md border text-xs font-medium tabular-nums',
                        row.position === 1 && 'border-primary bg-primary text-primary-foreground',
                      )}
                    >
                      {row.position}
                    </span>
                  </TableCell>
                  <TableCell className="px-2">
                    <span className="inline-flex items-center gap-2">
                      <Tag variant="muted">{clubsById.get(row.club_id)?.acronym ?? '—'}</Tag>
                      <Link to={`/clubes/${row.club_id}`} className="underline underline-offset-2">
                        {row.club_name}
                      </Link>
                    </span>
                  </TableCell>
                  {COLUMNS.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        'px-2 text-right tabular-nums last:pr-4',
                        col.key === 'points' && 'font-semibold',
                        row.played === 0 && col.key !== 'points' && 'text-muted-foreground',
                      )}
                    >
                      {col.key === 'goal_difference' ? signedInt(row[col.key]) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="border-t px-4 py-3 text-xs text-muted-foreground">
            J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols marcados · GC: gols
            sofridos · SG: saldo de gols · Pts: pontos
          </p>
        </>
      )}
    </section>
  )
}
