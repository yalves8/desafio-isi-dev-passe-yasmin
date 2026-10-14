import type { Club, Player } from '@/api/types'

export interface PlayerDetailsSheetProps {
  player: Player
  club?: Club
  onClose: () => void
  onEdit: () => void
  onCondition: () => void
  onBuy: () => void
  /** Motivo de a compra estar indisponível (ex.: liga sem clubes) */
  buyDisabledReason?: string
}
