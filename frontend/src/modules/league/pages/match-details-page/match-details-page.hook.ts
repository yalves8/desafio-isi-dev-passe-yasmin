import { useParams } from 'react-router'
import { matchesService } from '@/api/matches.service'
import { useBreadcrumbDetail } from '@/hooks/use-breadcrumb-detail'
import { useFetch } from '@/hooks/use-fetch'
import { useLeagueClubs } from '@/hooks/use-league-clubs'
import { useLeagueData } from '@/hooks/use-league-data'
import { matchTitle } from '../../league.utils'

export function useMatchDetailsPage() {
  const { id } = useParams()
  const matchId = Number(id)
  const { version, refresh } = useLeagueData()

  const match = useFetch(`match:${matchId}:${version}`, () => matchesService.get(matchId))
  const { byId: clubsById } = useLeagueClubs()
  useBreadcrumbDetail(match.data ? matchTitle(match.data) : undefined)

  return {
    match: { data: match.data, error: match.error, onRetry: refresh },
    clubsById,
  }
}
