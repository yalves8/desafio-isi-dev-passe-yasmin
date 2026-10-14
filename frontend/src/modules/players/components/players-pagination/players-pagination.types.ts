export interface PlayersPaginationProps {
  page: number
  totalPages: number
  /** Números visíveis (até 5 ao redor da atual) */
  pages: number[]
  /** "Mostrando 1–10 de 23 jogadores" */
  summary: string
  onChange: (page: number) => void
}
