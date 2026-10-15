import type { ReactNode } from 'react'
import type { Club, Match } from '@/api/types'

export interface MatchScoreboardProps {
  match: Match
  /** Siglas e links dos clubes (a partida traz só o nome) */
  clubsById: Map<number, Club>
  /** Mostra a formação de cada lado ("Mandante · 2-1-1") */
  showFormation?: boolean
  /** Ação à direita (ex.: "Ver duelos") */
  action?: ReactNode
}
