import type { DuelRole, DuelValues } from '@/api/types'
import type { LineupRow } from '../../clubs.types'

export interface LineupSlotsProps {
  rows: LineupRow[]
  /** Papel de cada vaga nos duelos, na ordem das linhas (`roles` de GET /clubs/{id}/duel-attributes) */
  duelRoles: DuelRole[][]
  /** Atributos de duelo de cada jogador do elenco, pelo id */
  duelValues: ReadonlyMap<number, DuelValues>
  onSelect: (slotKey: string, playerId: number) => void
}
