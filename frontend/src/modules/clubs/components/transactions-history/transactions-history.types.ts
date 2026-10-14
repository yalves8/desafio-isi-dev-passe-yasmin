import type { Club } from '@/api/types'

export interface TransactionsHistoryProps {
  club: Club
  /** Muda a cada ação que altera dados (recarrega o histórico) */
  version: number
}
