import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { clubsService } from '@/api/clubs.service'
import { matchesService } from '@/api/matches.service'
import type { Match } from '@/api/types'
import { useFetch } from '@/hooks/use-fetch'
import { useLeagueData } from '@/hooks/use-league-data'
import { matchTitle } from '../../league.utils'

/** Filtro por clube e diálogo "Nova partida" ficam na URL (?clube=1, ?nova=1) */
export function useMatchesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { version, refresh } = useLeagueData()
  const rawClub = Number(searchParams.get('clube'))
  const clubId = Number.isInteger(rawClub) && rawClub > 0 ? rawClub : undefined
  const isCreating = searchParams.get('nova') === '1'

  const setParam = (key: string, value?: string) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === undefined) next.delete(key)
      else next.set(key, value)
      return next
    })

  const clubs = useFetch(`clubs:${version}`, () => clubsService.list('name'), {
    keepPreviousData: true,
  })
  const clubList = useMemo(() => clubs.data ?? [], [clubs.data])
  const clubsById = useMemo(() => new Map(clubList.map((c) => [c.id, c])), [clubList])

  // A última partida é sempre a mais recente da liga, sem o filtro da tabela
  const latest = useFetch(`matches-all:${version}`, () => matchesService.list(), {
    keepPreviousData: true,
  })
  const list = useFetch(
    `matches:${clubId ?? 'all'}:${version}`,
    () => matchesService.list(clubId),
    { keepPreviousData: true },
  )

  return {
    header: { onCreate: () => setParam('nova', '1') },
    clubsById,
    latest: {
      match: latest.data?.[0],
      loading: latest.loading && latest.data === undefined,
    },
    table: {
      matches: list.data ?? [],
      clubsById,
      loading: list.loading,
      error: list.error,
      onRetry: refresh,
      filter: {
        clubId,
        clubs: clubList,
        onChange: (id?: number) => setParam('clube', id === undefined ? undefined : String(id)),
      },
    },
    dialog: {
      open: isCreating,
      clubs: clubList,
      close: () => setParam('nova'),
      onPlayed: (match: Match) => {
        refresh()
        toast.success('Partida jogada', {
          description: `${matchTitle(match)}. Placar e duelos devolvidos pela API.`,
        })
        void navigate(`/partidas/${match.id}`)
      },
    },
  }
}
