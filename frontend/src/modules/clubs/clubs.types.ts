import type { Player } from '@/api/types'

export type ClubDetailsTab = 'squad' | 'lineup' | 'history'

/** Setores da escalação: goleiro, defesa (ZAG/LAT), meio (MEI) e ataque (ATA) */
export type LineupSector = 'GK' | 'DEF' | 'MID' | 'ATT'

export interface LineupSlot {
  /** Ex.: "DEF-1" */
  key: string
  sector: LineupSector
}

/** Vaga → id do titular escolhido */
export type LineupSelection = Record<string, number | undefined>

export interface LineupRow {
  slot: LineupSlot
  player?: Player
  candidates: Player[]
  /** Vaga vazia ao tentar salvar */
  error?: string
}
