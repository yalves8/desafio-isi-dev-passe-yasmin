import type { Player } from '@/api/types'
import type { Sector } from '@/modules/players'

export type ClubDetailsTab = 'squad' | 'lineup' | 'history'

/** Setores da escalação: goleiro, defesa (ZAG/LAT), meio (MEI) e ataque (ATA) */
export type LineupSector = Sector

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
  /** Texto da vaga sem candidatos: falta a posição no elenco ou só jogador disponível */
  emptyText?: string
  /** Vaga vazia ao tentar salvar */
  error?: string
}
