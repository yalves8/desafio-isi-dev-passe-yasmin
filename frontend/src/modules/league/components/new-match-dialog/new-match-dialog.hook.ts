import { useState } from 'react'
import { matchesService } from '@/api/matches.service'
import type { Club, Match } from '@/api/types'
import { useInlineAction } from '@/hooks/use-inline-action'
import { refusedSide, validateClubs } from './new-match-dialog.utils'

export function useNewMatchDialog({
  clubs,
  onPlayed,
}: {
  clubs: Club[]
  onPlayed: (match: Match) => void
}) {
  const [homeId, setHomeId] = useState<number>()
  const [awayId, setAwayId] = useState<number>()
  const [submitted, setSubmitted] = useState(false)
  // Escalação incompleta e clube inexistente só a API sabe: a recusa fica no diálogo (L04)
  const play = useInlineAction(
    (input: { home_club_id: number; away_club_id: number }) => matchesService.play(input),
    { errorTitle: 'Não foi possível jogar a partida' },
  )
  const apiError = play.error?.message
  const errors = submitted ? validateClubs(homeId, awayId) : {}
  const byId = (id?: number) => clubs.find((c) => c.id === id)

  const onSubmit = async () => {
    setSubmitted(true)
    play.clearError()
    const invalid = validateClubs(homeId, awayId)
    if (invalid.home || invalid.away) return
    const result = await play.run({ home_club_id: homeId!, away_club_id: awayId! })
    if (result.ok) onPlayed(result.data)
  }

  return {
    home: { value: homeId, onChange: (id: number) => setHomeId(id), error: errors.home },
    away: { value: awayId, onChange: (id: number) => setAwayId(id), error: errors.away },
    apiError,
    refused: refusedSide(apiError, byId(homeId), byId(awayId)),
    isPlaying: play.isPending,
    onSubmit,
  }
}
