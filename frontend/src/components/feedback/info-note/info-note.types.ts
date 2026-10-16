import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface InfoNoteProps {
  /** Ícone à esquerda (ou ao lado do título); padrão: Info */
  icon?: LucideIcon
  /** Título em destaque; com ele, o conteúdo vem embaixo (pode ter vários parágrafos) */
  title?: string
  /** muted: fundo cinza · dashed: borda tracejada (dado travado) · outline: só a borda */
  variant?: 'muted' | 'dashed' | 'outline'
  /** "status" para aviso que aparece durante uma ação (ex.: enviando) */
  role?: 'status'
  children: ReactNode
}
