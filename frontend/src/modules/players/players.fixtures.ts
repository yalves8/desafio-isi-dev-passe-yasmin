import type { Player } from '@/api/types'

/** Jogador de teste; sobrescreva só o que importa para o caso */
export function playerFixture(overrides: Partial<Player> = {}): Player {
  return {
    id: 1,
    name: 'André Lacerda',
    position: 'GOL',
    agility: 70,
    age: 31,
    condition: 'APTO',
    base_value: 26,
    market_value: 26,
    pace: 50,
    shooting: 40,
    passing: 60,
    dribbling: 45,
    defending: 70,
    physical: 72,
    potential: 75,
    overall: 68,
    club_id: 2,
    ...overrides,
  }
}
