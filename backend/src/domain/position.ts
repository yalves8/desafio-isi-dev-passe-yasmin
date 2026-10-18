/** Posições na ordem oficial, de trás para frente no campo (RN11): a ordem é a prioridade */
export const POSITIONS = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'] as const;

export type Position = (typeof POSITIONS)[number];

/** Compara duas posições pela ordem oficial (RN07 e RN11). */
export function comparePositions(a: Position, b: Position): number {
  return POSITIONS.indexOf(a) - POSITIONS.indexOf(b);
}
