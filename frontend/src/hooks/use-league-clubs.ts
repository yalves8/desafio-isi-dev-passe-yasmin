import { useMemo } from 'react'
import { clubsService } from '@/api/clubs.service'
import { useFetch } from '@/hooks/use-fetch'
import { useLeagueData } from '@/hooks/use-league-data'

/**
 * Clubes da liga em ordem de nome, recarregados a cada mudança na liga (mantendo a lista
 * anterior enquanto carrega), com o índice por id usado para mostrar escudo e nome.
 */
export function useLeagueClubs() {
  const { version } = useLeagueData()
  const clubs = useFetch(`clubs:${version}`, () => clubsService.list('name'), {
    keepPreviousData: true,
  })
  const list = useMemo(() => clubs.data ?? [], [clubs.data])
  const byId = useMemo(() => new Map(list.map((c) => [c.id, c])), [list])

  return { ...clubs, list, byId }
}
