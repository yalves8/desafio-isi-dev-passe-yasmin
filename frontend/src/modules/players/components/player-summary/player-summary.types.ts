import type { ReactNode } from 'react'
import type { Player } from '@/api/types'

export interface PlayerSummaryProps {
  player: Player
  /** Conteúdo à direita (condição, "Livre") */
  aside?: ReactNode
  /** Valor de mercado à direita, como nos diálogos de compra e venda */
  showMarketValue?: boolean
}
