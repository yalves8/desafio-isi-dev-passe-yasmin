import { Loader2, SearchX, UserPlus, Users, X } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/feedback/states'
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
import { POSITION_LABEL } from '../../players.constants'
import { AgilityBar } from '../agility-bar/agility-bar'
import { BuyButton } from '../buy-button/buy-button'
import { ClubTag } from '../club-tag/club-tag'
import { ConditionBadge } from '../condition-badge/condition-badge'
import { PlayerAvatar } from '../player-avatar/player-avatar'
import { PlayerRowMenu } from '../player-row-menu/player-row-menu'
import { PlayersPagination } from '../players-pagination/players-pagination'
import { PlayersToolbar } from '../players-toolbar/players-toolbar'
import { PositionBadge } from '../position-badge/position-badge'
import type { PlayersTableProps } from './players-table.types'

const COLUMNS: { label: string; numeric?: boolean }[] = [
  { label: 'Jogador' },
  { label: 'Posição' },
  { label: 'Overall', numeric: true },
  { label: 'Agilidade', numeric: true },
  { label: 'Idade', numeric: true },
  { label: 'Condição' },
  { label: 'Valor base', numeric: true },
  { label: 'Valor de mercado', numeric: true },
  { label: 'Clube' },
]

/** Lista de jogadores com os estados de carregando, vazio e erro */
export function PlayersTable({ tabs, sort, list, actions, pagination }: PlayersTableProps) {
  const { players, clubsById, loading, error, empty } = list
  const showSkeleton = loading && players.length === 0 && !error
  const isEmpty = !loading && !error && players.length === 0

  return (
    <section
      aria-label="Lista de jogadores"
      className="overflow-hidden rounded-xl border bg-card shadow-2xs"
    >
      {error ? (
        <ErrorState
          title="Não foi possível carregar os jogadores"
          message={error}
          onRetry={list.onRetry}
        />
      ) : isEmpty ? (
        empty.hasFilters ? (
          <EmptyState
            icon={SearchX}
            title={
              empty.search
                ? `Nenhum jogador encontrado para “${empty.search}”`
                : 'Nenhum jogador encontrado'
            }
            description="Confira a grafia ou tire alguns filtros. A busca ignora maiúsculas, minúsculas e acentos."
            action={
              <Button variant="outline" size="md" onClick={empty.onClear}>
                <X /> Limpar filtros
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Users}
            title="Nenhum jogador cadastrado"
            description="Com o banco recém-criado, a lista começa vazia. Cadastre o primeiro jogador da liga."
            action={
              <Button variant="outline" size="md" onClick={empty.onCreate}>
                <UserPlus /> Novo jogador
              </Button>
            }
          />
        )
      ) : showSkeleton ? (
        <div className="flex items-center justify-between gap-3 p-4">
          <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Carregando jogadores…
          </p>
          <Skeleton className="h-9 w-56" />
        </div>
      ) : (
        <PlayersToolbar tabs={tabs} sort={sort} />
      )}

      {!error && !isEmpty && (
        <>
          <Table aria-busy={loading}>
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent">
                {COLUMNS.map((col) => (
                  <TableHead
                    key={col.label}
                    className={cn(
                      'h-10 px-2 font-normal text-muted-foreground first:pl-4',
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
            <TableBody className={cn(loading && 'opacity-60 transition-opacity')}>
              {showSkeleton
                ? Array.from({ length: 10 }, (_, i) => (
                    <TableRow key={i} className="h-14" aria-hidden>
                      <TableCell className="px-2 pl-4">
                        <span className="flex items-center gap-3">
                          <Skeleton className="size-8 rounded-full" />
                          <Skeleton className={cn('h-3', i % 2 ? 'w-36' : 'w-28')} />
                        </span>
                      </TableCell>
                      {COLUMNS.slice(1).map((col) => (
                        <TableCell key={col.label} className="px-2">
                          <Skeleton
                            className={cn(
                              'h-3',
                              col.label === 'Condição' ? 'h-5 w-20 rounded-full' : 'w-12',
                              col.numeric && 'ml-auto',
                            )}
                          />
                        </TableCell>
                      ))}
                      <TableCell className="pr-4">
                        <Skeleton className="ml-auto size-8 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                : players.map((player) => (
                    <TableRow
                      key={player.id}
                      data-highlighted={player.id === list.highlightId || undefined}
                      className="h-14 data-highlighted:bg-blue-50/70"
                    >
                      <TableCell className="px-2 pl-4">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar id={player.id} name={player.name} />
                          <div className="leading-tight">
                            <p className="font-medium">{player.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {POSITION_LABEL[player.position]}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-2">
                        <PositionBadge position={player.position} />
                      </TableCell>
                      <TableCell className="px-2 text-right font-semibold tabular-nums">
                        {player.overall}
                      </TableCell>
                      <TableCell className="px-2">
                        <span className="flex justify-end">
                          <AgilityBar value={player.agility} />
                        </span>
                      </TableCell>
                      <TableCell className="px-2 text-right tabular-nums">{player.age}</TableCell>
                      <TableCell className="px-2">
                        <ConditionBadge condition={player.condition} />
                      </TableCell>
                      <TableCell className="px-2 text-right text-muted-foreground tabular-nums">
                        {formatMoney(player.base_value)}
                      </TableCell>
                      <TableCell className="px-2 text-right font-semibold tabular-nums">
                        {formatMoney(player.market_value)}
                      </TableCell>
                      <TableCell className="px-2">
                        <ClubTag
                          club={player.club_id === null ? undefined : clubsById.get(player.club_id)}
                        />
                      </TableCell>
                      <TableCell className="pr-4 pl-2">
                        <div className="flex items-center justify-end gap-2">
                          {player.club_id === null && (
                            <BuyButton
                              size="sm"
                              onClick={() => actions.onBuy(player)}
                              disabledReason={actions.buyDisabledReason}
                            />
                          )}
                          <PlayerRowMenu player={player} actions={actions} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          <PlayersPagination {...pagination} />
        </>
      )}
    </section>
  )
}
