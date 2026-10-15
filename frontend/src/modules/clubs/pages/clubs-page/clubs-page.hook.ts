import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { clubsService } from '@/api/clubs.service'
import type { Club, ClubSort } from '@/api/types'
import { useFetch } from '@/hooks/use-fetch'
import { useLeagueData } from '@/hooks/use-league-data'
import { formatMoney } from '@/lib/format'
import { parseClubSort } from './clubs-page.utils'

export function useClubsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { version, refresh } = useLeagueData()
  const sort = parseClubSort(searchParams.get('sort'))
  // "+" da sidebar abre o diálogo pela URL (?novo=1)
  const isCreating = searchParams.get('novo') === '1'

  const clubs = useFetch(`clubs-page:${sort}:${version}`, () => clubsService.list(sort), {
    keepPreviousData: true,
  })
  const list = clubs.data ?? []

  const setParam = (key: string, value?: string) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === undefined) next.delete(key)
      else next.set(key, value)
      return next
    })

  return {
    // O limite de 20 clubes fica com a API: a tela envia e mostra o 409 no diálogo
    header: { onCreate: () => setParam('novo', '1') },
    table: {
      clubs: list,
      loading: clubs.loading,
      error: clubs.error,
      onRetry: refresh,
      onCreate: () => setParam('novo', '1'),
      sort,
      onSortChange: (value: ClubSort) => setParam('sort', value === 'name' ? undefined : value),
    },
    dialog: {
      open: isCreating,
      close: () => setParam('novo'),
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
