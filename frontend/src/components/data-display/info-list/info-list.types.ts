import type { ReactNode } from 'react'

export interface InfoListItem {
  label: string
  value: ReactNode
  description?: string
  /** Linha em destaque (fundo e valor maiores) */
  highlight?: boolean
}

export interface InfoListProps {
  items: InfoListItem[]
  className?: string
}
