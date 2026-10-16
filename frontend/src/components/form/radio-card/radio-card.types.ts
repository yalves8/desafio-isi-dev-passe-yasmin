import type { ReactNode } from 'react'

export interface RadioCardProps {
  /** Id do radio, ligado ao rótulo (o cartão inteiro é clicável) */
  id: string
  value: string
  checked: boolean
  disabled?: boolean
  /** Nome e descrição acessíveis do radio, quando o cartão tem mais texto que o nome */
  labelledBy?: string
  describedBy?: string
  /** Ajustes de espaçamento do cartão */
  className?: string
  /** Conteúdo do cartão; recebe o radio para posicioná-lo onde o layout pede */
  children: (radio: ReactNode) => ReactNode
}
