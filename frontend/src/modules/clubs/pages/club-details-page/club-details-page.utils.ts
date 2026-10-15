import type { Lineup, Player } from '@/api/types'
import { CLUB_TAB_PARAM, CLUB_TAB_SLUGS } from '../../clubs.constants'
import type { ClubDetailsTab } from '../../clubs.types'

/** Aba pelo endereço (`?aba=escalacao`); sem parâmetro ou com um inválido, abre o elenco */
export function parseClubTab(slug: string | null): ClubDetailsTab {
  const tabs = Object.keys(CLUB_TAB_SLUGS) as ClubDetailsTab[]
  return tabs.find((tab) => CLUB_TAB_SLUGS[tab] === slug) ?? 'squad'
}

/** Parâmetros do endereço para a aba: o elenco, aba padrão, fica sem parâmetro */
export function clubTabParams(tab: ClubDetailsTab): Record<string, string> {
  return tab === 'squad' ? {} : { [CLUB_TAB_PARAM]: CLUB_TAB_SLUGS[tab] }
}

/** Remonta o editor quando a escalação salva ou o elenco mudam (descarta escolhas não salvas) */
export function lineupEditorKey(lineup: Lineup, squad: Player[]) {
  return JSON.stringify([
    lineup.formation,
    lineup.players.map((p) => p.id),
    squad.map((p) => `${p.id}:${p.condition}`),
  ])
}
