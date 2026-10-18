import { describe, expect, it } from 'vitest'
import type { Condition } from '@/api/types'
import { canChangeCondition, CONDITION_RULES, POSITION_SECTOR } from './players.constants'

const CONDITIONS: Condition[] = ['APTO', 'MAL_CONDICIONADO', 'DOENTE']

describe('POSITION_SECTOR', () => {
  it('põe ZAG e LAT na defesa e cada outra posição no seu setor', () => {
    expect(POSITION_SECTOR).toEqual({ GOL: 'GK', ZAG: 'DEF', LAT: 'DEF', MEI: 'MID', ATA: 'ATT' })
  })
})

describe('CONDITION_RULES', () => {
  it('só DOENTE não pode ser escalado e sai da escalação (RN19)', () => {
    expect(CONDITIONS.filter((c) => !CONDITION_RULES[c].canStart)).toEqual(['DOENTE'])
    expect(CONDITIONS.filter((c) => CONDITION_RULES[c].leavesLineup)).toEqual(['DOENTE'])
  })

  it('só MAL_CONDICIONADO joga desgastado (RN20)', () => {
    expect(CONDITIONS.filter((c) => CONDITION_RULES[c].worn)).toEqual(['MAL_CONDICIONADO'])
  })

  it.each(CONDITIONS.flatMap((from) => CONDITIONS.map((to) => [from, to] as const)))(
    'de %s para %s só é proibido de DOENTE para APTO',
    (from, to) => {
      expect(canChangeCondition(from, to)).toBe(!(from === 'DOENTE' && to === 'APTO'))
    },
  )
})
