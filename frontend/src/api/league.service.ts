import { clubsService } from './clubs.service'
import { matchesService } from './matches.service'
import { playersService } from './players.service'
import type { LeagueStats } from './types'

export const leagueService = {
  /** Números da tela inicial; cada chamada que falha conta como 0, sem derrubar a tela */
  async getStats(): Promise<LeagueStats> {
    const [allPlayersRes, freePlayersRes, clubsRes, matchesRes, standingsRes] = await Promise.all([
      playersService.list({ limit: 1 }).catch(() => null),
      playersService.list({ limit: 1, free: true }).catch(() => null),
      clubsService.list().catch(() => null),
      matchesService.list().catch(() => null),
      matchesService.standings().catch(() => null),
    ])
    const totalMatches = matchesRes?.length ?? 0
    // Líder só depois da primeira partida: antes, todos estão zerados (RN21)
    const first = totalMatches > 0 ? standingsRes?.[0] : undefined

    return {
      totalPlayers: allPlayersRes?.meta?.total_items ?? 0,
      freePlayers: freePlayersRes?.meta?.total_items ?? 0,
      totalClubs: clubsRes?.length ?? 0,
      totalMatches,
      leader: first ? { name: first.club_name, points: first.points } : null,
    }
  },
}
