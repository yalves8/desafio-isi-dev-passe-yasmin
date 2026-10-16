import { ChevronRight, Shield, Swords } from 'lucide-react'
import { Link } from 'react-router'
import { DateTime } from '@/components/data-display/date-time/date-time'
import { DataTable } from '@/components/data-display/data-table/data-table'
import type { DataTableColumn } from '@/components/data-display/data-table/data-table.types'
import { Tag } from '@/components/data-display/tag/tag'
import { FilterSelect } from '@/components/form/filter-select/filter-select'
import { SectionCard } from '@/components/layout/section-card/section-card'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { plural } from '@/lib/format'
import { RESULT_LABEL } from '../../league.constants'
import { scoreLabel } from '../../league.utils'
import { TeamName } from '../team-name/team-name'
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

  return (
    <SectionCard
      title="Histórico de partidas"
      description="Da mais recente para a mais antiga."
      headerClassName="items-center border-b-0 px-4 py-3.5"
      actions={
        <FilterSelect
          icon={Shield}
          label="Filtrar por clube"
          prefix="Clube"
          allLabel="Todos os clubes"
          className="w-56"
          options={filter.clubs.map((club) => ({ value: String(club.id), label: club.name }))}
          value={filter.clubId === undefined ? undefined : String(filter.clubId)}
          onChange={(value) => filter.onChange(value === undefined ? undefined : Number(value))}
        />
      }
    >
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
          return (
            <TableRow data-testid={`match-row-${match.id}`} className="h-14">
              <TableCell className="px-2 pl-4">
                <DateTime iso={match.played_at} />
              </TableCell>
              <TableCell className="px-2 text-right">
                <span className="inline-flex items-center gap-2">
                  <TeamName match={match} side="home" />
                  <Tag variant="muted">{acronym(match.home.club_id)}</Tag>
                </span>
              </TableCell>
              <TableCell className="px-2 text-center">
                <Tag className="font-semibold tabular-nums">{scoreLabel(match)}</Tag>
              </TableCell>
              <TableCell className="px-2">
                <span className="inline-flex items-center gap-2">
                  <Tag variant="muted">{acronym(match.away.club_id)}</Tag>
                  <TeamName match={match} side="away" />
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
    </SectionCard>
  )
}
