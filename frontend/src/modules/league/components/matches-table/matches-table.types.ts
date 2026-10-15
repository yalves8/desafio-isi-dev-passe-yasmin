import type { Club, Match } from '@/api/types'

export interface MatchesTableProps {
  matches: Match[]
  clubsById: Map<number, Club>
  loading: boolean
  error: string | null
  onRetry: () => void
  filter: {
    clubId?: number
    clubs: Club[]
    onChange: (clubId?: number) => void
  }
}
