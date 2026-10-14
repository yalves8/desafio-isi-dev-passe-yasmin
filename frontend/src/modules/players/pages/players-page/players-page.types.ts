import type { Condition, Player, PlayerSort, Position } from '@/api/types'
import type { PlayersTab } from '../../players.types'

/** Estado da tela guardado na URL (filtros, aba, ordenação e página) */
export interface PlayersParams {
  search: string
  position?: Position
  condition?: Condition
  clubId?: number
  minAge?: number
  maxAge?: number
  minValue?: number
  maxValue?: number
  tab: PlayersTab
  sort: PlayerSort
  page: number
}

export type PlayerDialog =
  | { type: 'create' }
  | { type: 'created' | 'details' | 'edit' | 'condition' | 'delete'; player: Player }
  | null
