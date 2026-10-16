import type { Player } from '@/api/types'

export interface SellPlayerDialogProps {
  player: Player
  clubName: string
  /** Titular da escalação: avisa que ele sai dela e o clube fica sem poder jogar */
  isStarter: boolean
  isSelling: boolean
  /** `message` da API quando a venda é recusada */
  error?: string
  onClose: () => void
  onConfirm: () => void
}
