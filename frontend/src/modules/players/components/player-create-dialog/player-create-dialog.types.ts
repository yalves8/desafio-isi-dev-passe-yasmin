import type { Player } from '@/api/types'

export interface PlayerCreateDialogProps {
  onClose: () => void
  onCreated: (player: Player) => void
}
