import type { Club, Duel, DuelPlayer, Match } from '@/api/types'

const p = (
  id: number,
  name: string,
  position: DuelPlayer['position'],
  attribute: DuelPlayer['attribute'],
  value: number,
  condition: DuelPlayer['condition'] = 'APTO',
): DuelPlayer => ({ player_id: id, player_name: name, position, condition, attribute, value })

/** Duelos do exemplo da RN20: Águias FC (1, mandante) 1 × 2 Delta FC (2) */
const DUELS: Duel[] = [
  {
    order: 1,
    attacking_club_id: 1,
    attacker: p(34, 'Otto Rangel', 'ATA', 'shooting', 75),
    defender: p(40, 'Ivo Teles', 'GOL', 'defending', 72),
    goal: true,
  },
  {
    order: 2,
    attacking_club_id: 1,
    attacker: p(33, 'Lauro Neves', 'MEI', 'passing', 82),
    defender: p(41, 'Hugo Vaz', 'ZAG', 'defending', 84),
    goal: false,
  },
  {
    order: 3,
    attacking_club_id: 1,
    attacker: p(31, 'Davi Lins', 'LAT', 'dribbling', 63, 'MAL_CONDICIONADO'),
    defender: p(42, 'Lino Matos', 'LAT', 'defending', 63),
    goal: false,
  },
  {
    order: 4,
    attacking_club_id: 2,
    attacker: p(44, 'Ugo Falcão', 'ATA', 'shooting', 81),
    defender: p(30, 'Rui Prado', 'GOL', 'defending', 77),
    goal: true,
  },
  {
    order: 5,
    attacking_club_id: 2,
    attacker: p(43, 'Nei Soares', 'MEI', 'passing', 70),
    defender: p(32, 'Téo Brandão', 'ZAG', 'defending', 84),
    goal: false,
  },
  {
    order: 6,
    attacking_club_id: 2,
    attacker: p(42, 'Lino Matos', 'LAT', 'dribbling', 79),
    defender: p(31, 'Davi Lins', 'LAT', 'defending', 56, 'MAL_CONDICIONADO'),
    goal: true,
  },
]

export function matchFixture(overrides: Partial<Match> = {}): Match {
  return {
    id: 1,
    played_at: '2026-11-12T15:00:00-03:00',
    home: { club_id: 1, club_name: 'Águias FC', formation: '2-1-1', goals: 1 },
    away: { club_id: 2, club_name: 'Delta FC', formation: '2-1-1', goals: 2 },
    result: 'VISITANTE',
    duels: DUELS,
    ...overrides,
  }
}

export const CLUBS: Club[] = [
  { id: 1, name: 'Águias FC', acronym: 'AGU', cash: 300, squad_value: 0, net_worth: 300 },
  { id: 2, name: 'Delta FC', acronym: 'DEL', cash: 300, squad_value: 0, net_worth: 300 },
  { id: 3, name: 'Gama SC', acronym: 'GAM', cash: 300, squad_value: 0, net_worth: 300 },
]
