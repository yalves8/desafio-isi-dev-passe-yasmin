import type { Player } from '@/api/types'
import type { InlineError } from '@/hooks/use-inline-action'

export interface SellPlayerDialogProps {
  player: Player
  clubName: string
  /** Titular da escalação: avisa que ele sai dela e o clube fica sem poder jogar */
  isStarter: boolean
  isSelling: boolean
  /** Recusa da API (`message` dela) ou falha de rede, que pode ser enviada de novo */
  error?: InlineError
  onClose: () => void
  onConfirm: () => void
}
