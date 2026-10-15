import type { Key, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface DataTableColumn {
  /** Chave única da coluna; o rótulo é usado quando ela falta */
  key?: string
  label: string
  /** Alinha à direita (valores numéricos) */
  numeric?: boolean
  /** Rótulo só para leitor de tela (ex.: coluna de ações) */
  srOnly?: boolean
  /** Dica ao passar o mouse (ex.: "Jogos" para "J") */
  title?: string
  className?: string
}

interface DataTableEmpty {
  icon: LucideIcon
  title: string
  description?: ReactNode
  action?: ReactNode
}

export interface DataTableProps<T> {
  columns: DataTableColumn[]
  rows: T[]
  rowKey: (row: T) => Key
  /** Uma `TableRow` com as células da linha */
  renderRow: (row: T) => ReactNode
  /** Carregando: sem linhas, mostra o esqueleto; com linhas, esmaece as que já estão na tela */
  loading?: boolean
  /** Anuncia o esqueleto ao leitor de tela (ex.: "Carregando partidas") */
  loadingLabel?: string
  /** Quantas linhas o esqueleto tem */
  skeletonRows?: number
  /** Linha do esqueleto, quando ela imita as células (o padrão é uma barra só) */
  renderSkeletonRow?: (index: number) => ReactNode
  /** `message` da falha ao carregar; troca a tabela pelo erro com "Tentar de novo" */
  error?: string | null
  errorTitle?: string
  onRetry?: () => void
  /** Estado vazio, quando a lista carregou sem linhas */
  empty: DataTableEmpty
  /** Acima e abaixo da tabela, só quando ela aparece (barra de ferramentas, paginação, legenda) */
  toolbar?: ReactNode
  footer?: ReactNode
  /** Altura de cada linha do esqueleto padrão */
  skeletonRowClassName?: string
  headerCellClassName?: string
}
