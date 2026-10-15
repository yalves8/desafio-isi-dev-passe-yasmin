import type { Club, Player } from '@/api/types'
import type { PlayerRowActions } from '../player-row-menu/player-row-menu.types'
import type { PlayersPaginationProps } from '../players-pagination/players-pagination.types'
import type { PlayersToolbarProps } from '../players-toolbar/players-toolbar.types'

export interface PlayersTableProps extends PlayersToolbarProps {
  list: {
    players: Player[]
    clubsById: Map<number, Club>
    loading: boolean
    error: string | null
    onRetry: () => void
    /** Linha alterada pela última ação */
    highlightId?: number
    empty: {
      hasFilters: boolean
      /** Busca digitada, citada no estado vazio (E02) */
      search?: string
      onClear: () => void
      onCreate: () => void
    }
  }
  actions: PlayerRowActions
  pagination: PlayersPaginationProps
}
