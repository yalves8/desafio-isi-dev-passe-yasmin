import type { ReactNode } from 'react'

export interface SectionCardProps {
  title: string
  description?: ReactNode
  /** Ações à direita do título (botão, filtro, etiqueta) */
  actions?: ReactNode
  /** Nível do título: 2 nas seções da tela, 3 nas seções dentro de uma aba */
  headingLevel?: 2 | 3
  /** Sombra de cartão solto na tela; dentro de outro cartão fica sem */
  shadow?: boolean
  className?: string
  headerClassName?: string
  children?: ReactNode
}
