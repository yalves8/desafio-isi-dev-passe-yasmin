import type { Player } from '@/api/types'

export interface PlayerRowActions {
  onDetails: (player: Player) => void
  onEdit: (player: Player) => void
  onCondition: (player: Player) => void
  onDelete: (player: Player) => void
}

export interface PlayerRowMenuProps {
  player: Player
  actions: PlayerRowActions
}
