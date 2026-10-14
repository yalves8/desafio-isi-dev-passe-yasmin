import type { Club, Player } from '@/api/types'

export interface PlayerDetailsSheetProps {
  player: Player
  club?: Club
  onClose: () => void
  onEdit: () => void
  onCondition: () => void
}
