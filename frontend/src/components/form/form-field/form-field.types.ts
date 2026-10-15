import type { ReactNode } from 'react'

export interface FormFieldProps {
  /** id do controle; a dica/erro recebe `${id}-message` para o aria-describedby */
  id: string
  label: string
  hint?: string
  error?: string
  /**
   * Grupo de opções (ex.: cartões de posição) em vez de um controle só: o rótulo recebe
   * `${id}-label`, para o grupo usar no aria-labelledby
   */
  group?: boolean
  children: ReactNode
  className?: string
}
