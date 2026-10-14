import type { Formation } from '@/api/types'
import { FORMATIONS } from '../../clubs.constants'

/** Altura (y) de cada setor no mini campo de 32x42 do Figma, do ataque ao goleiro */
const ROW_Y = { ATT: 6.5, MID: 22, DEF: 29.5, GK: 37 } as const
/** Posições (x) dos jogadores numa linha com 1, 2 ou 3 jogadores */
const ROW_X: Record<number, number[]> = { 1: [16], 2: [10.5, 21.5], 3: [7.5, 16, 24.5] }

/** Pontos do mini campo: um por jogador da formação, mais o goleiro */
export function formationDots(formation: Formation) {
  const { DEF, MID, ATT } = FORMATIONS[formation]
  const rows = [
    { y: ROW_Y.ATT, count: ATT },
    { y: ROW_Y.MID, count: MID },
    { y: ROW_Y.DEF, count: DEF },
    { y: ROW_Y.GK, count: 1 },
  ]
  return rows.flatMap(({ y, count }) => (ROW_X[count] ?? []).map((x) => ({ x, y })))
}
