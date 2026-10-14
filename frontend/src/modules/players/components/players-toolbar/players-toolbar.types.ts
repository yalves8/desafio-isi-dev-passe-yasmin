import type { PlayerSort } from '@/api/types'
import type { PlayersTab } from '../../players.types'

export interface PlayersToolbarProps {
  tabs: {
    value: PlayersTab
    counts: Partial<Record<PlayersTab, number>>
    /** Motivo para a aba "Livres" ficar desabilitada (filtro por clube ativo) */
    freeDisabledReason?: string
    onChange: (tab: PlayersTab) => void
  }
  sort: { value: PlayerSort; onChange: (sort: PlayerSort) => void }
}
