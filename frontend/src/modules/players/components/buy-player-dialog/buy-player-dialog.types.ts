import type { Club, Player, PurchaseResult } from '@/api/types'

export interface BuyPlayerDialogProps {
  player: Player
  /** Clubes da liga, para escolher o comprador */
  clubs: Club[]
  onClose: () => void
  onBought: (purchase: PurchaseResult) => void
}

/** Recusa da API (400/404/409) ou falha de rede, mostrada no próprio diálogo */
export interface BuyError {
  kind: 'refused' | 'network'
  message: string
}
