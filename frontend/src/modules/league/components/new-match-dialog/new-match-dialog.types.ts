import type { Club, Match } from '@/api/types'

export interface NewMatchDialogProps {
  clubs: Club[]
  onClose: () => void
  onPlayed: (match: Match) => void
}
