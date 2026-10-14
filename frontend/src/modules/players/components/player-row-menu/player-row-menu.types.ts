import type { Player } from '@/api/types'

export interface PlayerRowActions {
  onDetails: (player: Player) => void
  onEdit: (player: Player) => void
  onCondition: (player: Player) => void
  onDelete: (player: Player) => void
  onBuy: (player: Player) => void
  /** Motivo de a compra estar indisponível (ex.: liga sem clubes) */
  buyDisabledReason?: string
}

export interface PlayerRowMenuProps {
  player: Player
  actions: PlayerRowActions
}
