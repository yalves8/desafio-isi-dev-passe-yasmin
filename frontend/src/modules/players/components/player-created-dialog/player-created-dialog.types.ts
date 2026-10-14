import type { Player } from '@/api/types'

export interface PlayerCreatedDialogProps {
  player: Player
  onClose: () => void
  onDetails: () => void
}
