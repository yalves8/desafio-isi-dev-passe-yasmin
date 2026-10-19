import type { ClubDuelAttributes, Formation, Lineup, Player } from '@/api/types'

export interface LineupEditorProps {
  clubName: string
  /** Elenco na ordem da RN11 (GET /clubs/{id}) */
  squad: Player[]
  /** Escalação salva (GET /clubs/{id}/lineup) */
  lineup: Lineup
  /** Papéis das vagas e atributos de duelo do elenco (GET /clubs/{id}/duel-attributes) */
  duels?: ClubDuelAttributes
  isSaving: boolean
  /** `message` do 409/404 da última tentativa de salvar */
  saveError?: string
  onSave: (formation: Formation, playerIds: number[]) => void
}
