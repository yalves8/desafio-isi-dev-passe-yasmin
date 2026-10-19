import { useState } from 'react'
import { clubsService } from '@/api/clubs.service'
import type { Condition, Player } from '@/api/types'
import { useFetch } from '@/hooks/use-fetch'
import { CONDITION_RULES } from '../../players.constants'
import { isConditionBlocked } from './player-condition-dialog.utils'

/** Só a escolha da condição; o envio é do hook da página */
export function usePlayerConditionDialog(player: Player) {
  const [selected, setSelected] = useState<Condition>(player.condition)
  // Jogador com clube: a escalação diz se ele é titular (sem clube, não há o que buscar)
  const lineup = useFetch(`lineup:${player.club_id ?? 'livre'}`, () =>
    player.club_id === null ? Promise.resolve(null) : clubsService.getLineup(player.club_id),
  )
  const isStarter = !!lineup.data?.players.some((p) => p.id === player.id)

  return {
    selected,
    select: (value: string) => setSelected(value as Condition),
    isBlocked: (value: Condition) => isConditionBlocked(player.condition, value),
    unchanged: selected === player.condition,
    // Titular que fica Doente sai da escalação (RN19)
    showLineupNotice:
      CONDITION_RULES[selected].leavesLineup &&
      !CONDITION_RULES[player.condition].leavesLineup &&
      isStarter,
  }
}
