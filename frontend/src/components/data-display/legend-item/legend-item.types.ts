import type { ReactNode } from 'react'

export interface LegendItemProps {
  /** Cor do quadradinho (ex.: "bg-primary"); sem ela, use `marker` */
  color?: string
  /** Marcador próprio no lugar do quadradinho (ex.: o ícone usado no campo) */
  marker?: ReactNode
  children: ReactNode
}
