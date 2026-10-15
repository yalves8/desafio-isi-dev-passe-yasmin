import { ListOrdered } from 'lucide-react'
import { Link } from 'react-router'
import { DataTable } from '@/components/data-display/data-table/data-table'
import type { DataTableColumn } from '@/components/data-display/data-table/data-table.types'
import { Tag } from '@/components/data-display/tag/tag'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { StandingsTableProps } from './standings-table.types'

const STATS = [
  { key: 'played', label: 'J', title: 'Jogos' },
  { key: 'wins', label: 'V', title: 'Vitórias' },
  { key: 'draws', label: 'E', title: 'Empates' },
  { key: 'losses', label: 'D', title: 'Derrotas' },
  { key: 'goals_for', label: 'GP', title: 'Gols marcados' },
  { key: 'goals_against', label: 'GC', title: 'Gols sofridos' },
  { key: 'goal_difference', label: 'SG', title: 'Saldo de gols' },
  { key: 'points', label: 'Pts', title: 'Pontos' },
] as const

const COLUMNS: DataTableColumn[] = [
  { label: '#', className: 'w-14 text-center' },
  { label: 'Clube' },
  ...STATS.map((col) => ({ ...col, numeric: true, className: 'w-12' })),
]

const signedInt = (value: number) => (value > 0 ? `+${value}` : value < 0 ? `-${-value}` : '0')

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
      <DataTable
        columns={COLUMNS}
        rows={standings}
        rowKey={(row) => row.club_id}
        loading={loading}
        loadingLabel="Carregando classificação"
        skeletonRows={2}
        skeletonRowClassName="h-13"
        error={error}
        errorTitle="Não foi possível carregar a classificação"
        onRetry={onRetry}
        empty={{
          icon: ListOrdered,
          title: 'Nenhum clube cadastrado',
          description: 'A classificação mostra todos os clubes, mesmo os que ainda não jogaram.',
        }}
        footer={
          <p className="border-t px-4 py-3 text-xs text-muted-foreground">
            J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols marcados · GC: gols
            sofridos · SG: saldo de gols · Pts: pontos
          </p>
        }
        renderRow={(row) => (
          <TableRow className="h-13">
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
            {STATS.map((col) => (
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
        )}
      />
    </section>
  )
}
