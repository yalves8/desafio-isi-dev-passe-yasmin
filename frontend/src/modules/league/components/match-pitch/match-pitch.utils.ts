import type { Position } from '@/api/types'
import type { MatchStarter } from '../../league.utils'

/** Distância da linha do gol de cada setor, em % da largura (Figma L03, lado do mandante) */
const COLUMN_X = { GK: 6.5, DEF: 17.5, MID: 28.5, ATT: 39 } as const
/** Posições verticais (%) para 1, 2 ou 3 jogadores na mesma linha */
const ROWS_Y: Record<number, number[]> = { 1: [50], 2: [32, 68], 3: [22, 50, 78] }

function columnOf(position: Position): keyof typeof COLUMN_X {
  if (position === 'GOL') return 'GK'
  if (position === 'MEI') return 'MID'
  if (position === 'ATA') return 'ATT'
  return 'DEF'
}

/** Posição de cada titular no campo; o visitante fica espelhado, atacando para a esquerda */
export function pitchSpots(starters: MatchStarter[], side: 'home' | 'away') {
  const columns = new Map<string, MatchStarter[]>()
  for (const s of starters) {
    const key = columnOf(s.position)
    columns.set(key, [...(columns.get(key) ?? []), s])
  }
  return starters.map((starter) => {
    const key = columnOf(starter.position)
    const line = columns.get(key)!
    const x = COLUMN_X[key]
    return {
      starter,
      left: side === 'home' ? x : 100 - x,
      top: ROWS_Y[line.length]?.[line.indexOf(starter)] ?? 50,
    }
  })
}
