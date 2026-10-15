import type { Club, Match } from '@/api/types'

export interface DuelsTableProps {
  /** Partida com os 6 duelos gravados */
  match: Match
  clubsById: Map<number, Club>
}
