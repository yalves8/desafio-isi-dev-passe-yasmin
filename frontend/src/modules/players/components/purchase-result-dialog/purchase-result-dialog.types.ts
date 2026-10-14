import type { PurchaseResult } from '@/api/types'

export interface PurchaseResultDialogProps {
  purchase: PurchaseResult
  /** Nome do clube comprador (a resposta da compra traz só o id) */
  clubName: string
  onClose: () => void
  onViewClub: () => void
}
