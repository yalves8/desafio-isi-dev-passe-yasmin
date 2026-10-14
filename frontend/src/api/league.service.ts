import { clubsService } from './clubs.service'
import { playersService } from './players.service'
import type { LeagueStats } from './types'

export const leagueService = {
  async getStats(): Promise<LeagueStats> {
    try {
      const [allPlayersRes, freePlayersRes, clubsRes] = await Promise.all([
        playersService.list({ limit: 1 }).catch(() => null),
        playersService.list({ limit: 1, free: true }).catch(() => null),
        clubsService.list().catch(() => null),
      ])

      return {
        totalPlayers: allPlayersRes?.meta?.total_items ?? 0,
        freePlayers: freePlayersRes?.meta?.total_items ?? 0,
        totalClubs: clubsRes?.length ?? 0,
        totalMatches: 0,
        leader: null,
      }
    } catch {
      return {
        totalPlayers: 0,
        freePlayers: 0,
        totalClubs: 0,
        totalMatches: 0,
        leader: null,
      }
    }
  },
}
