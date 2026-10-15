import type { ReactNode } from 'react'

export interface AlertMessageProps {
  /** `error`: recusa ou falha (role="alert"); `warning`: aviso que não bloqueia (role="note") */
  variant: 'error' | 'warning'
  title: string
  children: ReactNode
  className?: string
}
