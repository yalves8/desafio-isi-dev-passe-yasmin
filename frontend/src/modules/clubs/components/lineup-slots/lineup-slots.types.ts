import type { LineupRow } from '../../clubs.types'

export interface LineupSlotsProps {
  rows: LineupRow[]
  onSelect: (slotKey: string, playerId: number) => void
}
