import type { Duel, DuelAttribute, DuelPlayer, Match, Position } from '@/api/types'

/** "2 × 1", com o placar devolvido pela API */
export function scoreLabel(match: Match) {
  return `${match.home.goals} × ${match.away.goals}`
}

/** "Delta FC 2 × 1 Águias FC" */
export function matchTitle(match: Match) {
  return `${match.home.club_name} ${scoreLabel(match)} ${match.away.club_name}`
}

/** Lado vencedor, para destacar o nome; null no empate */
export function winnerSide(match: Match): 'home' | 'away' | null {
  if (match.result === 'MANDANTE') return 'home'
  if (match.result === 'VISITANTE') return 'away'
  return null
}

/** Papel do titular: goleiro ou o número do jogador de linha, do 1º (mais recuado) ao 4º */
export type LineSlot = 'GK' | 1 | 2 | 3 | 4

/** Titular como aparece nos duelos gravados: valores de ataque e de defesa usados */
export interface MatchStarter {
  slot: LineSlot
  playerId: number
  name: string
  position: Position
  condition: DuelPlayer['condition']
  values: { attribute: DuelAttribute; value: number }[]
  /** Marcou gol no duelo em que atacou */
  scored: boolean
}

// Nos 3 ataques de um time: o 4º enfrenta o goleiro, o 3º o 1º e o 2º o 2º (RN20)
const ATTACKER_SLOTS: LineSlot[] = [4, 3, 2]
const DEFENDER_SLOTS: LineSlot[] = ['GK', 1, 2]

/**
 * Os 5 titulares de um clube, montados só a partir dos duelos gravados (nada é recalculado):
 * cada titular aparece como atacante, defensor ou os dois (o 2º jogador de linha).
 */
export function startersFromDuels(duels: Duel[], clubId: number): MatchStarter[] {
  const bySlot = new Map<LineSlot, MatchStarter>()
  const add = (slot: LineSlot, p: DuelPlayer, scored = false) => {
    const current = bySlot.get(slot)
    const value = { attribute: p.attribute, value: p.value }
    if (current) {
      current.values.push(value)
      current.scored ||= scored
    } else {
      bySlot.set(slot, {
        slot,
        playerId: p.player_id,
        name: p.player_name,
        position: p.position,
        condition: p.condition,
        values: [value],
        scored,
      })
    }
  }
  const sorted = [...duels].sort((a, b) => a.order - b.order)
  sorted
    .filter((d) => d.attacking_club_id === clubId)
    .forEach((d, i) => add(ATTACKER_SLOTS[i], d.attacker, d.goal))
  sorted
    .filter((d) => d.attacking_club_id !== clubId)
    .forEach((d, i) => add(DEFENDER_SLOTS[i], d.defender))
  // Ataque antes da defesa, como no Figma ("LAT · Dri 75 · Def 63")
  for (const starter of bySlot.values()) {
    starter.values.sort(
      (a, b) => Number(a.attribute === 'defending') - Number(b.attribute === 'defending'),
    )
  }
  return (['GK', 1, 2, 3, 4] as LineSlot[]).flatMap((slot) => bySlot.get(slot) ?? [])
}

/** "Goleiro" ou "ATA, 4º de linha" */
export function slotLabel(slot: LineSlot, position: Position) {
  return slot === 'GK' ? 'Goleiro' : `${position}, ${slot}º de linha`
}
