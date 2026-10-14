import type { ReactElement } from 'react'

export interface DisabledHintProps {
  /** Motivo do bloqueio; sem motivo, o filho é renderizado sem dica */
  reason?: string
  children: ReactElement
  className?: string
}
