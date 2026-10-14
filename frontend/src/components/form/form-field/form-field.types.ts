import type { ReactNode } from 'react'

export interface FormFieldProps {
  /** id do controle; a dica/erro recebe `${id}-message` para o aria-describedby */
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}
