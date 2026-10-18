import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { clubsService } from '@/api/clubs.service'
import type { Club, ClubSort } from '@/api/types'
import { useFetch } from '@/hooks/use-fetch'
import { useLeagueData } from '@/hooks/use-league-data'
import { useSearchParam } from '@/hooks/use-search-param'
import { formatMoney } from '@/lib/format'
import { flagCodec } from '@/lib/search-params'
import { clubSortCodec } from './clubs-page.utils'

export function useClubsPage() {
  const navigate = useNavigate()
  const { version, refresh } = useLeagueData()
  const [sort, setSort] = useSearchParam('sort', clubSortCodec)
  // "+" da sidebar abre o diálogo pela URL (?novo=1)
  const [isCreating, setCreating] = useSearchParam('novo', flagCodec)

  const clubs = useFetch(`clubs-page:${sort}:${version}`, () => clubsService.list(sort), {
    keepPreviousData: true,
  })
  const list = clubs.data ?? []

  return {
    // O limite de 20 clubes fica com a API: a tela envia e mostra o 409 no diálogo
    header: { onCreate: () => setCreating(true) },
    table: {
      clubs: list,
      loading: clubs.loading,
      error: clubs.error,
      onRetry: refresh,
      onCreate: () => setCreating(true),
      sort,
      onSortChange: (value: ClubSort) => setSort(value),
    },
    dialog: {
      open: isCreating,
      close: () => setCreating(false),
      onCreated: (club: Club) => {
        refresh()
        toast.success('Clube criado', {
          description: `${club.name} (${club.acronym}) começa com ${formatMoney(club.cash)} em caixa.`,
        })
        void navigate(`/clubes/${club.id}`)
      },
    },
  }
}
