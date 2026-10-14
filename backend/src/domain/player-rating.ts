import { Cents, roundDiv } from './money.js';

export type Position = 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA';

export interface Attributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

// Ordem dos pesos: pace, shooting, passing, dribbling, defending, physical.
const WEIGHTS: Record<Position, readonly number[]> = {
  GOL: [10, 0, 20, 0, 40, 30],
  ZAG: [10, 0, 15, 0, 45, 30],
  LAT: [25, 0, 20, 15, 25, 15],
  MEI: [10, 15, 35, 25, 5, 10],
  ATA: [20, 40, 10, 20, 0, 10],
};

/** RN06: overall inteiro, com meio para cima. */
export function overall(position: Position, attributes: Attributes): number {
  const values = [
    attributes.pace,
    attributes.shooting,
    attributes.passing,
    attributes.dribbling,
    attributes.defending,
    attributes.physical,
  ];
  const weighted = values.reduce(
    (sum, value, index) => sum + value * WEIGHTS[position][index],
    0,
  );
  return Math.floor((weighted + 50) / 100);
}

// Valor por ponto de overall, em centavos, por faixa.
const TIERS = [
  { from: 40, to: 60, perPoint: 50 },
  { from: 60, to: 75, perPoint: 200 },
  { from: 75, to: 99, perPoint: 600 },
] as const;
const YOUNG_PROMISE_MAX_AGE = 21;
const MIN_BASE_VALUE: Cents = 100;

/** RN06: valor base, calculado uma única vez no cadastro. */
export function baseValue(
  overallRating: number,
  potential: number,
  ageAtRegistration: number,
): Cents {
  const part = TIERS.reduce(
    (sum, tier) =>
      sum +
      tier.perPoint * Math.max(0, Math.min(overallRating, tier.to) - tier.from),
    0,
  );
  const total =
    ageAtRegistration <= YOUNG_PROMISE_MAX_AGE
      ? roundDiv(part * (100 + potential - overallRating), 100)
      : part;
  return Math.max(total, MIN_BASE_VALUE);
}
