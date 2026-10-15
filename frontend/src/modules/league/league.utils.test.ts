import type { Duel, DuelPlayer, Match } from '@/api/types'
import { matchTitle, slotLabel, startersFromDuels, winnerSide } from './league.utils'

const p = (
  id: number,
  name: string,
  position: DuelPlayer['position'],
  attribute: DuelPlayer['attribute'],
  value: number,
  condition: DuelPlayer['condition'] = 'APTO',
): DuelPlayer => ({ player_id: id, player_name: name, position, condition, attribute, value })

// Exemplo da RN20: Águias FC (1, mandante) 1 × 2 Delta FC (2)
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

const MATCH: Match = {
  id: 1,
  played_at: '2026-11-12T15:00:00-03:00',
  home: { club_id: 1, club_name: 'Águias FC', formation: '2-1-1', goals: 1 },
  away: { club_id: 2, club_name: 'Delta FC', formation: '2-1-1', goals: 2 },
  result: 'VISITANTE',
  duels: DUELS,
}

describe('league utils', () => {
  it('deve montar os 5 titulares de cada clube a partir dos duelos gravados', () => {
    const homeStarters = startersFromDuels(DUELS, 1)
    expect(
      homeStarters.map((s) => [s.slot, s.name, s.values.map((v) => v.value), s.scored]),
    ).toEqual([
      ['GK', 'Rui Prado', [77], false],
      [1, 'Téo Brandão', [84], false],
      [2, 'Davi Lins', [63, 56], false],
      [3, 'Lauro Neves', [82], false],
      [4, 'Otto Rangel', [75], true],
    ])
    expect(startersFromDuels(DUELS, 2).find((s) => s.slot === 2)).toMatchObject({
      name: 'Lino Matos',
      values: [
        { attribute: 'dribbling', value: 79 },
        { attribute: 'defending', value: 63 },
      ],
      scored: true,
    })
  })

  it('deve descrever o placar, o vencedor e o papel do titular', () => {
    expect(matchTitle(MATCH)).toBe('Águias FC 1 × 2 Delta FC')
    expect(winnerSide(MATCH)).toBe('away')
    expect(winnerSide({ ...MATCH, result: 'EMPATE' })).toBeNull()
    expect(slotLabel('GK', 'GOL')).toBe('Goleiro')
    expect(slotLabel(4, 'ATA')).toBe('ATA, 4º de linha')
  })
})
