import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { clubsService } from '@/api/clubs.service'
import { playersService } from '@/api/players.service'
import type { Club, Condition, Player } from '@/api/types'
import { useAction } from '@/hooks/use-action'
import { useFetch } from '@/hooks/use-fetch'
import { useLeagueData } from '@/hooks/use-league-data'
import { formatMoney } from '@/lib/format'
import {
  AGE_LIMITS,
  CONDITION_BY_VALUE,
  CONDITION_OPTIONS,
  MARKET_VALUE_LIMITS,
  POSITION_OPTIONS,
} from '../../players.constants'
import type { FilterKey, PlayersTab } from '../../players.types'
import type { PlayerDialog, PlayersParams } from './players-page.types'
import {
  CLEARED_FILTERS,
  clearFilter,
  getFilterChips,
  getPageNumbers,
  formatRange,
  paginationSummary,
  parsePlayersParams,
  toApiFilters,
  toSearchParams,
} from './players-page.utils'

const SEARCH_DEBOUNCE_MS = 300
const FREE_WITH_CLUB_REASON = '“Livres” não combina com o filtro por clube.'

export function usePlayersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(() => parsePlayersParams(searchParams), [searchParams])
  const { version, refresh } = useLeagueData()

  const [searchInput, setSearchInput] = useState(params.search)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [dialog, setDialog] = useState<PlayerDialog>(null)
  const [highlightId, setHighlightId] = useState<number>()

  /** Qualquer mudança de filtro volta para a página 1 */
  const updateParams = (patch: Partial<PlayersParams>, resetPage = true) =>
    setSearchParams((prev) =>
      toSearchParams({
        ...parsePlayersParams(prev),
        ...(resetPage ? { page: 1 } : {}),
        ...patch,
      }),
    )

  const apiFilters = toApiFilters(params)
  const list = useFetch(
    `players:${JSON.stringify(apiFilters)}:${version}`,
    () => playersService.list(apiFilters),
    { keepPreviousData: true },
  )

  // Contagem das abas com os mesmos filtros; "Livres" não é pedida com clube (a API recusa)
  const countFilters = { ...toApiFilters({ ...params, tab: 'all', page: 1 }), limit: 1 }
  const counts = useFetch(
    `players-counts:${JSON.stringify(countFilters)}:${version}`,
    async () => {
      const [all, free] = await Promise.all([
        playersService.list(countFilters),
        countFilters.club_id === undefined
          ? playersService.list({ ...countFilters, free: true })
          : null,
      ])
      const total = all.meta.total_items
      const freeTotal = free?.meta.total_items ?? 0
      return { all: total, free: freeTotal, clubs: total - freeTotal }
    },
    { keepPreviousData: true },
  )

  const clubs = useFetch(`clubs:${version}`, () => clubsService.list('name'), {
    keepPreviousData: true,
  })
  const clubList = useMemo(() => clubs.data ?? [], [clubs.data])
  const clubsById = useMemo(() => new Map(clubList.map((c) => [c.id, c])), [clubList])
  const clubOf = (player: Player): Club | undefined =>
    player.club_id === null ? undefined : clubsById.get(player.club_id)

  const players = list.data?.data ?? []
  const meta = list.data?.meta
  const chips = getFilterChips(params, clubList)

  const onSearchChange = (value: string) => {
    setSearchInput(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => updateParams({ search: value }), SEARCH_DEBOUNCE_MS)
  }

  const removeFilter = (key: FilterKey) => {
    if (key === 'search') {
      clearTimeout(searchTimer.current)
      setSearchInput('')
    }
    updateParams(clearFilter(key))
  }

  const clearFilters = (extra: Partial<PlayersParams> = {}) => {
    clearTimeout(searchTimer.current)
    setSearchInput('')
    updateParams({ ...CLEARED_FILTERS, ...extra })
  }

  const open = (type: Exclude<NonNullable<PlayerDialog>['type'], 'create'>) => (player: Player) =>
    setDialog({ type, player })
  const closeDialog = () => setDialog(null)

  /** Após uma ação: recarrega lista e sidebar e destaca a linha alterada */
  const afterChange = (player?: Player) => {
    setHighlightId(player?.id)
    refresh()
  }

  const conditionAction = useAction(
    (player: Player, condition: Condition) => playersService.updateCondition(player.id, condition),
    { errorTitle: 'Não foi possível alterar a condição' },
  )
  const deleteAction = useAction((player: Player) => playersService.delete(player.id), {
    errorTitle: 'Não foi possível excluir',
  })

  const changeCondition = async (player: Player, condition: Condition) => {
    const result = await conditionAction.run(player, condition)
    if (!result.ok) return
    const updated = result.data
    afterChange(updated)
    closeDialog()
    toast.success('Condição alterada', {
      description: `${updated.name} agora está ${CONDITION_BY_VALUE[updated.condition].label}. Valor de mercado: ${formatMoney(updated.market_value)}.`,
    })
  }

  const deletePlayer = async (player: Player) => {
    const result = await deleteAction.run(player)
    if (!result.ok) return
    closeDialog()
    // Se a página ficou vazia, volta uma
    if (players.length === 1 && params.page > 1) updateParams({ page: params.page - 1 }, false)
    afterChange()
    toast.success('Jogador excluído', {
      description: `${player.name} saiu da lista. Transações e partidas antigas dele continuam gravadas.`,
    })
  }

  return {
    header: { onCreate: () => setDialog({ type: 'create' }) },
    filters: {
      search: { value: searchInput, onChange: onSearchChange },
      position: {
        value: params.position,
        options: POSITION_OPTIONS.map((p) => ({ value: p.value, label: p.label })),
        onChange: (value?: string) =>
          updateParams({ position: value as PlayersParams['position'] }),
      },
      condition: {
        value: params.condition,
        options: CONDITION_OPTIONS.map((c) => ({ value: c.value, label: c.label })),
        onChange: (value?: string) =>
          updateParams({ condition: value as PlayersParams['condition'] }),
      },
      club: {
        value: params.clubId === undefined ? undefined : String(params.clubId),
        options: clubList.map((c) => ({ value: String(c.id), label: c.name })),
        onChange: (value?: string) =>
          updateParams({ clubId: value === undefined ? undefined : Number(value) }),
        disabledReason: params.tab === 'free' ? FREE_WITH_CLUB_REASON : undefined,
      },
      age: {
        min: params.minAge,
        max: params.maxAge,
        bounds: AGE_LIMITS,
        decimals: 0,
        activeLabel:
          params.minAge !== undefined || params.maxAge !== undefined
            ? `Idade: ${formatRange(params.minAge, params.maxAge)}`
            : undefined,
        onApply: (minAge?: number, maxAge?: number) => updateParams({ minAge, maxAge }),
      },
      value: {
        min: params.minValue,
        max: params.maxValue,
        bounds: MARKET_VALUE_LIMITS,
        decimals: 2,
        activeLabel:
          params.minValue !== undefined || params.maxValue !== undefined
            ? `Valor: ${formatRange(params.minValue, params.maxValue, formatMoney)}`
            : undefined,
        onApply: (minValue?: number, maxValue?: number) => updateParams({ minValue, maxValue }),
      },
    },
    activeFilters: {
      chips,
      searchOnly: chips.length === 1 && chips[0].key === 'search',
      onRemove: removeFilter,
      onClear: () => clearFilters(),
    },
    table: {
      tabs: {
        value: params.tab,
        counts: counts.data ?? {},
        freeDisabledReason:
          params.clubId !== undefined && params.tab !== 'free' ? FREE_WITH_CLUB_REASON : undefined,
        onChange: (tab: PlayersTab) => updateParams({ tab }),
      },
      sort: {
        value: params.sort,
        onChange: (sort: PlayersParams['sort']) => updateParams({ sort }),
      },
      list: {
        players,
        clubsById,
        loading: list.loading,
        error: list.error,
        onRetry: refresh,
        highlightId,
        empty: {
          hasFilters: chips.length > 0 || params.tab !== 'all',
          onClear: () => clearFilters({ tab: 'all' }),
          onCreate: () => setDialog({ type: 'create' }),
        },
      },
      actions: {
        onDetails: open('details'),
        onEdit: open('edit'),
        onCondition: open('condition'),
        onDelete: open('delete'),
      },
      pagination: {
        page: params.page,
        totalPages: meta?.total_pages ?? 1,
        pages: getPageNumbers(params.page, meta?.total_pages ?? 1),
        summary: paginationSummary(params.page, meta?.total_items ?? 0),
        onChange: (page: number) => updateParams({ page }, false),
      },
    },
    dialog: {
      current: dialog,
      clubOf,
      close: closeDialog,
      open,
      onCreated: (player: Player) => {
        afterChange(player)
        setDialog({ type: 'created', player })
      },
      onUpdated: (player: Player) => {
        afterChange(player)
        closeDialog()
        toast.success('Jogador atualizado', {
          description: `${player.name}: valor de mercado ${formatMoney(player.market_value)}.`,
        })
      },
      condition: { isSubmitting: conditionAction.isPending, onConfirm: changeCondition },
      remove: { isDeleting: deleteAction.isPending, onConfirm: deletePlayer },
    },
  }
}
