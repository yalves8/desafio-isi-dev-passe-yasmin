import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { clubsService } from '@/api/clubs.service'
import { matchesService } from '@/api/matches.service'
import { useFetch } from '@/hooks/use-fetch'
import { useLeagueData } from '@/hooks/use-league-data'

const RECENT_MATCHES = 5

export function useStandingsPage() {
  const navigate = useNavigate()
  const { version, refresh } = useLeagueData()

  const standings = useFetch(`standings:${version}`, () => matchesService.standings(), {
    keepPreviousData: true,
  })
  const matches = useFetch(`matches-all:${version}`, () => matchesService.list(), {
    keepPreviousData: true,
  })
  const clubs = useFetch(`clubs:${version}`, () => clubsService.list('name'), {
    keepPreviousData: true,
  })
  const clubsById = useMemo(() => new Map((clubs.data ?? []).map((c) => [c.id, c])), [clubs.data])
  const rows = standings.data ?? []

  return {
    header: { onCreate: () => void navigate('/partidas?nova=1') },
    table: {
      standings: rows,
      clubsById,
      loading: standings.loading,
      error: standings.error,
      onRetry: refresh,
    },
    recent: (matches.data ?? []).slice(0, RECENT_MATCHES),
    total: rows.length,
  }
}
