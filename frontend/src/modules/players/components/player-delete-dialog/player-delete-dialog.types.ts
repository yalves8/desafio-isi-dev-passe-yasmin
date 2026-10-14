import type { Player } from '@/api/types'

export interface PlayerDeleteDialogProps {
  player: Player
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}
