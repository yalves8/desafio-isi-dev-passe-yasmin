import { useState } from 'react'
import type { Condition, Player } from '@/api/types'
import { CONDITION_RULES } from '../../players.constants'
import { isConditionBlocked } from './player-condition-dialog.utils'

/** Só a escolha da condição; o envio é do hook da página */
export function usePlayerConditionDialog(player: Player) {
  const [selected, setSelected] = useState<Condition>(player.condition)

  return {
    selected,
    select: (value: string) => setSelected(value as Condition),
    isBlocked: (value: Condition) => isConditionBlocked(player.condition, value),
    unchanged: selected === player.condition,
    // Jogador com clube pode ser titular: ao ficar Doente sai da escalação (RN19)
    showLineupNotice:
      CONDITION_RULES[selected].leavesLineup &&
      !CONDITION_RULES[player.condition].leavesLineup &&
      player.club_id !== null,
  }
}
