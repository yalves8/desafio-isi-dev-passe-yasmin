import type { Player } from '@/api/types'

export interface SquadTableProps {
  players: Player[]
  onSell: (player: Player) => void
}
