import type { Transaction } from '@/api/types'

export interface TransactionsTableProps {
  transactions: Transaction[]
  /** Primeira busca, ainda sem lista: mostra o esqueleto */
  loading: boolean
  /** Muda o texto do estado vazio ("com esses filtros") */
  hasFilters: boolean
}
