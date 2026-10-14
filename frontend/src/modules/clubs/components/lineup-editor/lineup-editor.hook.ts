import { useMemo, useState } from 'react'
import type { Formation, Lineup, Player } from '@/api/types'
import type { LineupSelection } from '../../clubs.types'
import {
  assignPlayers,
  buildRows,
  canAnyFormationClose,
  initialFormation,
} from './lineup-editor.utils'

/** Só a escolha da formação e dos titulares; quem salva é o hook da página */
export function useLineupEditor({ lineup, squad }: { lineup: Lineup; squad: Player[] }) {
  const savedFormation = initialFormation(lineup.formation)
  // Os titulares salvos vêm do elenco atual (condição e valores de agora). Sem escalação salva,
  // a tela sugere o elenco disponível na formação padrão — nada é gravado até salvar
  const savedSelection = useMemo(() => {
    if (lineup.formation === null) {
      return assignPlayers(
        savedFormation,
        squad.filter((p) => p.condition !== 'DOENTE'),
      )
    }
    const ids = new Set(lineup.players.map((p) => p.id))
    return assignPlayers(
      savedFormation,
      squad.filter((p) => ids.has(p.id)),
    )
  }, [lineup.formation, lineup.players, savedFormation, squad])

  const [formation, setFormation] = useState<Formation>(savedFormation)
  const [selection, setSelection] = useState<LineupSelection>(savedSelection)

  const rows = buildRows(formation, selection, squad)
  const starters = rows.flatMap((r) => (r.player ? [r.player] : []))
  const chosenIds = new Set(starters.map((p) => p.id))
  const filled = rows.every((r) => r.player)

  return {
    formation,
    rows,
    starters,
    reserves: squad.filter((p) => !chosenIds.has(p.id)),
    worn: starters.filter((p) => p.condition === 'MAL_CONDICIONADO'),
    filled,
    canClose: canAnyFormationClose(squad),
    /** Troca a formação mantendo quem ainda cabe nas vagas novas */
    changeFormation: (next: Formation) => {
      setFormation(next)
      setSelection(assignPlayers(next, starters))
    },
    select: (slotKey: string, playerId: number) =>
      setSelection((prev) => ({ ...prev, [slotKey]: playerId })),
    reset: () => {
      setFormation(savedFormation)
      setSelection(savedSelection)
    },
    playerIds: starters.map((p) => p.id),
  }
}
