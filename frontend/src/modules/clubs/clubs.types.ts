import type { Player } from '@/api/types'

export type ClubDetailsTab = 'elenco' | 'escalacao' | 'historico'

/** Setores da escalação: goleiro, defesa (ZAG/LAT), meio (MEI) e ataque (ATA) */
export type LineupSector = 'GOL' | 'DEF' | 'MID' | 'ATT'

export interface LineupSlot {
  /** Ex.: "DEF-1" */
  key: string
  sector: LineupSector
}

/** Vaga → id do titular escolhido */
export type LineupSelection = Record<string, number | undefined>

/** Atributo que o titular usa na partida (RN20) */
export interface UsedAttribute {
  label: string
  value: number
}

export interface LineupRow {
  slot: LineupSlot
  player?: Player
  candidates: Player[]
  attributes: UsedAttribute[]
}
