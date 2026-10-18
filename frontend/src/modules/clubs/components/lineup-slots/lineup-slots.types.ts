import type { DuelRole } from '@/api/types'
import type { LineupRow } from '../../clubs.types'

export interface LineupSlotsProps {
  rows: LineupRow[]
  /** Papel de cada vaga nos duelos, na ordem das linhas (`duel_roles` da API) */
  duelRoles: DuelRole[][]
  onSelect: (slotKey: string, playerId: number) => void
}
