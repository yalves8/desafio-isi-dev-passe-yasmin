import type { Player } from '@/api/types'

export interface SellPlayerDialogProps {
  player: Player
  clubName: string
  isSelling: boolean
  onClose: () => void
  onConfirm: () => void
}
