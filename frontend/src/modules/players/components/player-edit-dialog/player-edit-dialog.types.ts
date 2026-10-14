import type { Player } from '@/api/types'

export interface PlayerEditDialogProps {
  player: Player
  onClose: () => void
  onUpdated: (player: Player) => void
}
