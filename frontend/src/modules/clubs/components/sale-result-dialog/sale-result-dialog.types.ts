import type { SaleResult } from '@/api/types'

export interface SaleResultDialogProps {
  sale: SaleResult
  /** Nome do clube vendedor (a resposta da venda traz só o id) */
  clubName: string
  /** O jogador era titular e saiu da escalação */
  wasStarter: boolean
  onClose: () => void
  onViewHistory: () => void
}
