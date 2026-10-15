import { clubsService } from '@/api/clubs.service'
import { matchesService } from '@/api/matches.service'
import { playersService } from '@/api/players.service'
import { useFetch } from '@/hooks/use-fetch'
import { useLeagueData } from '@/hooks/use-league-data'
import { plural } from '@/lib/format'
import { matchTitle } from '@/modules/league/league.utils'

export function useAppSidebar() {
  const { version } = useLeagueData()

  const { data } = useFetch(
    `sidebar-${version}`,
    async () => {
      const [players, clubs, matches] = await Promise.all([
        playersService.list({ limit: 1 }),
        clubsService.list('name'),
        matchesService.list(),
      ])
      return { totalPlayers: players.meta.total_items, clubs, matches }
    },
    { keepPreviousData: true },
  )

  return {
    clubs: data?.clubs ?? [],
    clubsLoaded: data !== undefined,
    counts: {
      '/jogadores': data?.totalPlayers,
      '/clubes': data?.clubs.length,
      '/partidas': data?.matches.length,
    } as Record<string, number | undefined>,
    summary: data
      ? `${plural(data.clubs.length, 'clube')} · ${plural(data.totalPlayers, 'jogador', 'jogadores')}`
      : 'Carregando…',
    /** A mais recente da liga: "Delta FC 2 × 1 Águias FC" */
    lastMatch: data?.matches[0] ? matchTitle(data.matches[0]) : undefined,
    lastMatchId: data?.matches[0]?.id,
  }
}
