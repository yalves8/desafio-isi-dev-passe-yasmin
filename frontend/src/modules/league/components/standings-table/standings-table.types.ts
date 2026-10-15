import type { Club, Standing } from '@/api/types'

export interface StandingsTableProps {
  standings: Standing[]
  clubsById: Map<number, Club>
  loading: boolean
  error: string | null
  onRetry: () => void
}
