import {
  DUEL_ROLES,
  duelValues,
  playMatch,
  Starter,
} from '../../domain/match-engine.js';
import { Attributes } from '../../domain/player-rating.js';
import { computeStandings } from '../domain/standings.js';

const BASE: Attributes = {
  pace: 50,
  shooting: 50,
  passing: 50,
  dribbling: 50,
  defending: 50,
  physical: 50,
};

function starter(
  id: number,
  name: string,
  position: Starter['position'],
  attributes: Partial<Attributes>,
  condition: Starter['condition'] = 'APTO',
): Starter {
  return {
    id,
    name,
    position,
    condition,
    attributes: { ...BASE, ...attributes },
  };
}

// Exemplo completo da RN20: Águias FC (mandante) × Delta FC (visitante), os dois no 2-1-1
const AGUIAS = [
  starter(30, 'Rui Prado', 'GOL', { defending: 77 }),
  starter(32, 'Téo Brandão', 'ZAG', { defending: 84 }),
  starter(
    31,
    'Davi Lins',
    'LAT',
    { dribbling: 74, defending: 66 },
    'MAL_CONDICIONADO',
  ),
  starter(33, 'Lauro Neves', 'MEI', { passing: 82 }),
  starter(34, 'Otto Rangel', 'ATA', { shooting: 75 }),
];
const DELTA = [
  starter(40, 'Ivo Teles', 'GOL', { defending: 72 }),
  starter(41, 'Hugo Vaz', 'ZAG', { defending: 84 }),
  starter(42, 'Lino Matos', 'LAT', { dribbling: 79, defending: 63 }),
  starter(43, 'Nei Soares', 'MEI', { passing: 70 }),
  starter(44, 'Ugo Falcão', 'ATA', { shooting: 81 }),
];

describe('playMatch (RN20)', () => {
  it('deve jogar os 6 duelos do exemplo e chegar a Águias FC 1 × 2 Delta FC', () => {
    const outcome = playMatch(AGUIAS, DELTA);

    expect(
      outcome.duels.map((d) => [
        d.order,
        d.attacker.player.name,
        d.attacker.attribute,
        d.attacker.value,
        d.defender.player.name,
        d.defender.value,
        d.goal,
      ]),
    ).toEqual([
      [1, 'Otto Rangel', 'shooting', 75, 'Ivo Teles', 72, true],
      [2, 'Lauro Neves', 'passing', 82, 'Hugo Vaz', 84, false],
      [3, 'Davi Lins', 'dribbling', 63, 'Lino Matos', 63, false],
      [4, 'Ugo Falcão', 'shooting', 81, 'Rui Prado', 77, true],
      [5, 'Nei Soares', 'passing', 70, 'Téo Brandão', 84, false],
      [6, 'Lino Matos', 'dribbling', 79, 'Davi Lins', 56, true],
    ]);
    expect(outcome).toMatchObject({
      homeGoals: 1,
      awayGoals: 2,
      result: 'VISITANTE',
    });
  });

  it('deve arredondar o efeito da condição com o meio para cima (50 × 0,85 = 42,5 → 43)', () => {
    const tired = [
      AGUIAS[0],
      AGUIAS[1],
      starter(
        31,
        'Davi Lins',
        'LAT',
        { dribbling: 50, defending: 66 },
        'MAL_CONDICIONADO',
      ),
      AGUIAS[3],
      AGUIAS[4],
    ];
    expect(playMatch(tired, DELTA).duels[2].attacker.value).toBe(43);
  });

  it('deve dar empate com os mesmos gols', () => {
    expect(playMatch(AGUIAS, AGUIAS).result).toBe('EMPATE');
  });
});

describe('computeStandings (RN21)', () => {
  it('deve ordenar por pontos, saldo, gols marcados e nome, incluindo quem não jogou', () => {
    const clubs = [
      { id: 1, name: 'Águias FC' },
      { id: 2, name: 'Delta FC' },
      { id: 3, name: 'Épsilon EC' },
      { id: 4, name: 'Gama SC' },
      { id: 5, name: 'Mangue FC' },
      { id: 6, name: 'Tubarões EC' },
    ];
    const matches = [
      { homeClubId: 1, awayClubId: 2, homeGoals: 1, awayGoals: 2 },
      { homeClubId: 4, awayClubId: 3, homeGoals: 2, awayGoals: 1 },
      { homeClubId: 3, awayClubId: 1, homeGoals: 3, awayGoals: 2 },
      { homeClubId: 2, awayClubId: 4, homeGoals: 0, awayGoals: 1 },
    ];

    const table = computeStandings(clubs, matches);

    expect(
      table.map((row) => [
        row.position,
        row.clubName,
        row.points,
        row.goalDifference,
        row.goalsFor,
      ]),
    ).toEqual([
      [1, 'Gama SC', 6, 2, 3],
      [2, 'Épsilon EC', 3, 0, 4],
      [3, 'Delta FC', 3, 0, 2],
      [4, 'Mangue FC', 0, 0, 0],
      [5, 'Tubarões EC', 0, 0, 0],
      [6, 'Águias FC', 0, -2, 3],
    ]);
    expect(table[0]).toEqual({
      position: 1,
      clubId: 4,
      clubName: 'Gama SC',
      played: 2,
      wins: 2,
      draws: 0,
      losses: 0,
      goalsFor: 3,
      goalsAgainst: 1,
      goalDifference: 2,
      points: 6,
    });
  });

  it('deve contar empate como 1 ponto para cada lado', () => {
    const table = computeStandings(
      [
        { id: 1, name: 'A Clube' },
        { id: 2, name: 'B Clube' },
      ],
      [{ homeClubId: 1, awayClubId: 2, homeGoals: 1, awayGoals: 1 }],
    );
    expect(table.map((r) => [r.clubId, r.draws, r.points])).toEqual([
      [1, 1, 1],
      [2, 1, 1],
    ]);
  });
});

describe('papéis e valores de duelo (RN20)', () => {
  it('deve dar a cada vaga o papel que ela tem nos duelos da partida', () => {
    const outcome = playMatch(AGUIAS, DELTA);
    const roles = AGUIAS.map((player) => {
      const duels = outcome.duels;
      const attacks = duels.some((d) => d.attacker.player.id === player.id);
      const defends = duels.some((d) => d.defender.player.id === player.id);
      return [attacks && 'attack', defends && 'defense'].filter(Boolean);
    });

    expect(DUEL_ROLES).toEqual(roles);
    expect(DUEL_ROLES).toEqual([
      ['defense'],
      ['defense'],
      ['attack', 'defense'],
      ['attack'],
      ['attack'],
    ]);
  });

  it('deve dar o atributo de ataque da posição e a defesa, brutos e com o efeito da condição', () => {
    expect(duelValues(AGUIAS[2])).toEqual({
      attack: { attribute: 'dribbling', value: 74, matchValue: 63 },
      defense: { attribute: 'defending', value: 66, matchValue: 56 },
    });
    expect(duelValues(AGUIAS[4])).toEqual({
      attack: { attribute: 'shooting', value: 75, matchValue: 75 },
      defense: { attribute: 'defending', value: 50, matchValue: 50 },
    });
  });
});
