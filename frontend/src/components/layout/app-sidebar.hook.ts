import { clubsService } from '@/api/clubs.service'
import { playersService } from '@/api/players.service'
import { useFetch } from '@/hooks/use-fetch'
import { useLeagueData } from '@/hooks/use-league-data'

export function useAppSidebar() {
  const { version } = useLeagueData()

  const { data } = useFetch(
    `sidebar-${version}`,
    async () => {
      const [players, clubs] = await Promise.all([
        playersService.list({ limit: 1 }),
        clubsService.list('name'),
      ])
      return { totalPlayers: players.meta.total_items, clubs }
    },
    { keepPreviousData: true },
  )

  return {
    clubs: data?.clubs ?? [],
    counts: {
      '/jogadores': data?.totalPlayers,
      '/clubes': data?.clubs.length,
    } as Record<string, number | undefined>,
    summary: data ? `${data.clubs.length} clubes · ${data.totalPlayers} jogadores` : 'Carregando…',
  }
}
