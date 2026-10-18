import type { Club, Lineup, Player, TransactionsResponse } from '@/api/types'

export function clubFixture(overrides: Partial<Club> = {}): Club {
  return {
    id: 1,
    name: 'Águias FC',
    acronym: 'AGU',
    cash: 51.58,
    squad_value: 222.68,
    net_worth: 274.26,
    ...overrides,
  }
}

/** Jogador do elenco, com contrato; sobrescreva só o que importa para o caso */
export function squadPlayerFixture(overrides: Partial<Player> = {}): Player {
  return {
    id: 1,
    name: 'Bruno Tavares',
    position: 'GOL',
    agility: 58,
    age: 29,
    condition: 'APTO',
    base_value: 32,
    market_value: 32,
    pace: 50,
    shooting: 40,
    passing: 60,
    dribbling: 45,
    defending: 77,
    physical: 70,
    potential: 80,
    overall: 71,
    club_id: 1,
    contract: {
      purchase_value: 32,
      loyalty_until: '2028-11-03T11:20:00-03:00',
      remaining_days: 722,
      penalty_rate: 20,
    },
    ...overrides,
  }
}

export function lineupFixture(overrides: Partial<Lineup> = {}): Lineup {
  return {
    club_id: 1,
    formation: null,
    complete: false,
    players: [],
    duel_roles: [['defense'], ['defense'], ['attack', 'defense'], ['attack'], ['attack']],
    ...overrides,
  }
}

export function transactionsFixture(
  overrides: Partial<TransactionsResponse> = {},
): TransactionsResponse {
  return {
    data: [],
    summary: {
      total_spent: 0,
      total_received: 0,
      total_fees: 0,
      total_penalties: 0,
      total_profit: 0,
    },
    ...overrides,
  }
}
