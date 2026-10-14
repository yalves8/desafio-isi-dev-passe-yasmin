import type { Lineup, Player } from '@/api/types'
import { CLUB_DETAILS_TABS } from '../../clubs.constants'
import type { ClubDetailsTab } from '../../clubs.types'

export function parseClubTab(value: string | null): ClubDetailsTab {
  return CLUB_DETAILS_TABS.includes(value as ClubDetailsTab) ? (value as ClubDetailsTab) : 'elenco'
}

/** Remonta o editor quando a escalação salva ou o elenco mudam (descarta escolhas não salvas) */
export function lineupEditorKey(lineup: Lineup, squad: Player[]) {
  return JSON.stringify([
    lineup.formation,
    lineup.players.map((p) => p.id),
    squad.map((p) => `${p.id}:${p.condition}`),
  ])
}
