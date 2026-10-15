import type { PlayerFilters } from '@/api/players.service'
import type { Club, Condition, PlayerSort, Position } from '@/api/types'
import { formatMoney, plural } from '@/lib/format'
import {
  CONDITION_BY_VALUE,
  PAGE_SIZE,
  POSITION_LABEL,
  SORT_OPTIONS,
} from '../../players.constants'
import type { FilterChip, FilterKey, PlayersTab } from '../../players.types'
import type { PlayersParams } from './players-page.types'

const TABS: PlayersTab[] = ['all', 'free', 'clubs']
/** A API exige busca com pelo menos 2 caracteres */
const MIN_SEARCH_LENGTH = 2

export const DEFAULT_PARAMS: PlayersParams = {
  search: '',
  tab: 'all',
  sort: 'name',
  page: 1,
}

function toNumber(value: string | null) {
  if (value === null || value.trim() === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[]) {
  return allowed.includes(value as T) ? (value as T) : undefined
}

/**
 * Lê a URL ignorando valores inválidos (a URL pode ter sido editada à mão).
 * "Livres" e filtro por clube não se combinam (a API devolve 400): na aba Livres o clube é descartado.
 */
export function parsePlayersParams(sp: URLSearchParams): PlayersParams {
  const page = toNumber(sp.get('page'))
  const tab = oneOf(sp.get('tab'), TABS) ?? DEFAULT_PARAMS.tab
  return {
    search: sp.get('search') ?? '',
    position: oneOf<Position>(sp.get('position'), Object.keys(POSITION_LABEL) as Position[]),
    condition: oneOf<Condition>(
      sp.get('condition'),
      Object.keys(CONDITION_BY_VALUE) as Condition[],
    ),
    clubId: tab === 'free' ? undefined : toNumber(sp.get('club')),
    minAge: toNumber(sp.get('min_age')),
    maxAge: toNumber(sp.get('max_age')),
    minValue: toNumber(sp.get('min_value')),
    maxValue: toNumber(sp.get('max_value')),
    tab,
    sort:
      oneOf<PlayerSort>(
        sp.get('sort'),
        SORT_OPTIONS.map((o) => o.value),
      ) ?? DEFAULT_PARAMS.sort,
    page: page && page >= 1 ? Math.floor(page) : 1,
  }
}

/** Escreve só o que difere do padrão, para a URL ficar curta */
export function toSearchParams(params: PlayersParams) {
  const entries: [string, string | number | undefined][] = [
    ['search', params.search || undefined],
    ['position', params.position],
    ['condition', params.condition],
    ['club', params.clubId],
    ['min_age', params.minAge],
    ['max_age', params.maxAge],
    ['min_value', params.minValue],
    ['max_value', params.maxValue],
    ['tab', params.tab === DEFAULT_PARAMS.tab ? undefined : params.tab],
    ['sort', params.sort === DEFAULT_PARAMS.sort ? undefined : params.sort],
    ['page', params.page === 1 ? undefined : params.page],
  ]
  const sp = new URLSearchParams()
  for (const [key, value] of entries) if (value !== undefined) sp.set(key, String(value))
  return sp
}

/** Converte o estado da tela nos query params da API */
export function toApiFilters(params: PlayersParams): PlayerFilters {
  const search = params.search.trim()
  return {
    page: params.page,
    limit: PAGE_SIZE,
    sort: params.sort,
    search: search.length >= MIN_SEARCH_LENGTH ? search : undefined,
    position: params.position,
    condition: params.condition,
    free: params.tab === 'all' ? undefined : params.tab === 'free',
    club_id: params.clubId,
    min_age: params.minAge,
    max_age: params.maxAge,
    min_value: params.minValue,
    max_value: params.maxValue,
  }
}

/** "18 a 30", "a partir de 18" ou "até 30" */
export function formatRange(
  min: number | undefined,
  max: number | undefined,
  format: (n: number) => string = String,
) {
  if (min !== undefined && max !== undefined) return `${format(min)} a ${format(max)}`
  if (min !== undefined) return `a partir de ${format(min)}`
  if (max !== undefined) return `até ${format(max)}`
  return ''
}

export function getFilterChips(params: PlayersParams, clubs: Club[]): FilterChip[] {
  const chips: FilterChip[] = []
  if (params.search.trim()) chips.push({ key: 'search', label: `Busca: ${params.search.trim()}` })
  if (params.position)
    chips.push({ key: 'position', label: `Posição: ${POSITION_LABEL[params.position]}` })
  if (params.condition)
    chips.push({
      key: 'condition',
      label: `Condição: ${CONDITION_BY_VALUE[params.condition].label}`,
    })
  if (params.clubId !== undefined && params.tab !== 'free') {
    const club = clubs.find((c) => c.id === params.clubId)
    chips.push({ key: 'clubId', label: `Clube: ${club?.name ?? `#${params.clubId}`}` })
  }
  if (params.minAge !== undefined || params.maxAge !== undefined)
    chips.push({ key: 'age', label: `Idade: ${formatRange(params.minAge, params.maxAge)}` })
  if (params.minValue !== undefined || params.maxValue !== undefined)
    chips.push({
      key: 'value',
      label: `Valor de mercado: ${formatRange(params.minValue, params.maxValue, formatMoney)}`,
    })
  return chips
}

/** Campos a limpar ao remover um chip */
export function clearFilter(key: FilterKey): Partial<PlayersParams> {
  switch (key) {
    case 'age':
      return { minAge: undefined, maxAge: undefined }
    case 'value':
      return { minValue: undefined, maxValue: undefined }
    case 'search':
      return { search: '' }
    default:
      return { [key]: undefined }
  }
}

export const CLEARED_FILTERS: Partial<PlayersParams> = {
  search: '',
  position: undefined,
  condition: undefined,
  clubId: undefined,
  minAge: undefined,
  maxAge: undefined,
  minValue: undefined,
  maxValue: undefined,
}

/** Até 5 números de página ao redor da atual */
export function getPageNumbers(page: number, totalPages: number, size = 5) {
  if (totalPages <= 0) return [1]
  const half = Math.floor(size / 2)
  const start = Math.max(1, Math.min(page - half, totalPages - size + 1))
  const end = Math.min(totalPages, start + size - 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/** "Mostrando 1–10 de 23 jogadores" */
export function paginationSummary(page: number, total: number, pageSize = PAGE_SIZE) {
  if (total === 0) return 'Nenhum jogador'
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return `Mostrando ${from}–${to} de ${plural(total, 'jogador', 'jogadores')}`
}
