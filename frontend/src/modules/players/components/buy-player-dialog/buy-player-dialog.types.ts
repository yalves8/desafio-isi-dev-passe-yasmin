import type { Club, Player, PurchaseResult } from '@/api/types'

export interface BuyPlayerDialogProps {
  player: Player
  /** Clubes da liga, para escolher o comprador */
  clubs: Club[]
  onClose: () => void
  onBought: (purchase: PurchaseResult) => void
}
