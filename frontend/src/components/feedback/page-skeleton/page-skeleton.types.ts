import type { ReactNode } from 'react'

export interface PageSkeletonProps {
  /** Anunciado ao leitor de tela enquanto carrega (ex.: "Carregando clube") */
  label: string
  /** Esqueletos no formato da tela que vai aparecer */
  children: ReactNode
}
