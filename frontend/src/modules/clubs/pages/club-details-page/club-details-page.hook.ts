import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { clubsService } from '@/api/clubs.service'
import { playersService } from '@/api/players.service'
import type { Formation, Player } from '@/api/types'
import { useAction } from '@/hooks/use-action'
import { useBreadcrumbDetail } from '@/hooks/use-breadcrumb-detail'
import { useFetch } from '@/hooks/use-fetch'
import { useLeagueData } from '@/hooks/use-league-data'
import { CLUB_TAB_PARAM } from '../../clubs.constants'
import type { ClubDetailsTab } from '../../clubs.types'
import type { ClubDetailsDialog } from './club-details-page.types'
import { clubTabParams, lineupEditorKey, parseClubTab } from './club-details-page.utils'

export function useClubDetailsPage() {
  const { id } = useParams()
  const clubId = Number(id)
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = parseClubTab(searchParams.get(CLUB_TAB_PARAM))
  const { version, refresh } = useLeagueData()
  const [dialog, setDialog] = useState<ClubDetailsDialog>(null)
  const [lineupError, setLineupError] = useState<string>()

  const club = useFetch(`club:${clubId}:${version}`, () => clubsService.get(clubId), {
    keepPreviousData: true,
  })
  const lineup = useFetch(`lineup:${clubId}:${version}`, () => clubsService.getLineup(clubId), {
    keepPreviousData: true,
  })
  const history = useFetch(`transactions-count:${clubId}:${version}`, () =>
    clubsService.getTransactions(clubId),
  )
  // Clube inexistente (ou id inválido na URL): a API responde 404 e a trilha mostra o id (E04)
  const notFound = club.errorStatus === 404
  useBreadcrumbDetail(club.data?.name ?? (notFound ? `Clube ${id}` : undefined))

  const squad = club.data?.players ?? []

  const sellAction = useAction((player: Player) => playersService.sell(player.id), {
    errorTitle: 'Não foi possível vender',
  })
  // A recusa da escalação aparece no card, com o `message` da API (409/404)
  const lineupAction = useAction(
    (formation: Formation, playerIds: number[]) =>
      clubsService.updateLineup(clubId, { formation, player_ids: playerIds }),
    { errorTitle: 'A escalação foi recusada', toastOnError: false },
  )

  const sell = async (player: Player) => {
    const result = await sellAction.run(player)
    if (!result.ok) return
    setDialog({ type: 'sold', sale: result.data })
    refresh()
  }

  const saveLineup = async (formation: Formation, playerIds: number[]) => {
    setLineupError(undefined)
    const result = await lineupAction.run(formation, playerIds)
    if (result.ok) {
      toast.success('Escalação salva', {
        description: `${club.data?.name} na ${result.data.formation}, com os ${result.data.players.length} titulares devolvidos pela API.`,
      })
    } else {
      setLineupError(result.error)
    }
    // Sucesso ou recusa: recarrega elenco e escalação com o que ficou gravado
    refresh()
  }

  return {
    club: {
      data: club.data,
      loading: club.loading && !club.data,
      error: club.error,
      notFound,
      onRetry: refresh,
    },
    squad,
    tabs: {
      value: tab,
      counts: {
        squad: club.data ? squad.length : undefined,
        history: history.data?.data.length,
      },
      onChange: (next: ClubDetailsTab) => {
        setLineupError(undefined)
        setSearchParams(clubTabParams(next))
      },
    },
    lineup: {
      data: lineup.data,
      error: lineup.error,
      editorKey: lineup.data ? lineupEditorKey(lineup.data, squad) : '',
      isSaving: lineupAction.isPending,
      saveError: lineupError,
      onSave: (formation: Formation, playerIds: number[]) => void saveLineup(formation, playerIds),
      onRetry: refresh,
    },
    version,
    dialog: {
      current: dialog,
      close: () => setDialog(null),
      openSell: (player: Player) => setDialog({ type: 'sell', player }),
      isSelling: sellAction.isPending,
      confirmSell: (player: Player) => void sell(player),
    },
  }
}
