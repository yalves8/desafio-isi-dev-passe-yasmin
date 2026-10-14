import type { Club, Condition, Player } from '@/api/types'

export interface PlayerConditionDialogProps {
  player: Player
  club?: Club
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (condition: Condition) => void
}
