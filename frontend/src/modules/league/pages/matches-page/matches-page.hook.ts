import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { matchesService } from '@/api/matches.service'
import type { Match } from '@/api/types'
import { useFetch } from '@/hooks/use-fetch'
import { useLeagueClubs } from '@/hooks/use-league-clubs'
import { useLeagueData } from '@/hooks/use-league-data'
import { useSearchParam } from '@/hooks/use-search-param'
import { flagCodec, intCodec } from '@/lib/search-params'
import { matchTitle } from '../../league.utils'

const CLUB_ID_CODEC = intCodec({ min: 1 })

/** Filtro por clube e diálogo "Nova partida" ficam na URL (?clube=1, ?nova=1) */
export function useMatchesPage() {
  const navigate = useNavigate()
  const { version, refresh } = useLeagueData()
  const [clubId, setClubId] = useSearchParam('clube', CLUB_ID_CODEC)
  const [isCreating, setCreating] = useSearchParam('nova', flagCodec)

  const { list: clubList, byId: clubsById } = useLeagueClubs()

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
    header: { onCreate: () => setCreating(true) },
    clubsById,
    latest: {
      match: latest.data?.[0],
      loading: latest.loading && latest.data === undefined,
    },
    /** Liga sem nenhuma partida (E06): a tela mostra só o convite para jogar a primeira */
    leagueEmpty: latest.data?.length === 0 && !latest.error && clubId === undefined,
    table: {
      matches: list.data ?? [],
      clubsById,
      loading: list.loading,
      error: list.error,
      onRetry: refresh,
      filter: {
        clubId,
        clubs: clubList,
        onChange: (id?: number) => setClubId(id),
      },
    },
    dialog: {
      open: isCreating,
      clubs: clubList,
      close: () => setCreating(false),
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
