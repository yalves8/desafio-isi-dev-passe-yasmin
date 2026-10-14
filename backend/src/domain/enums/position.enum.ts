/**
 * Enum com as posições oficiais dos atletas na liga fictícia.
 *
 * @export
 * @enum {string}
 */
export enum PositionEnum {
  GOL = 'GOL',
  ZAG = 'ZAG',
  LAT = 'LAT',
  MEI = 'MEI',
  ATA = 'ATA',
}

/**
 * Precedência e prioridade das posições para ordenação do elenco (RN11) e listagem (RN07).
 *
 * Ordem definida de trás para frente no campo: GOL (1), ZAG (2), LAT (3), MEI (4), ATA (5).
 *
 * @export
 * @enum {number}
 */
export enum PositionPriorityEnum {
  GOL = 1,
  ZAG = 2,
  LAT = 3,
  MEI = 4,
  ATA = 5,
}

/**
 * Compara a precedência de duas posições na ordem da RN11.
 *
 * @param {string} a - Primeira posição.
 * @param {string} b - Segunda posição.
 * @returns {number} Valor negativo se 'a' vier antes, positivo se vier depois, ou 0.
 */
export function comparePositions(a: string, b: string): number {
  const pA =
    PositionPriorityEnum[a as keyof typeof PositionPriorityEnum] ?? 99;
  const pB =
    PositionPriorityEnum[b as keyof typeof PositionPriorityEnum] ?? 99;
  return pA - pB;
}
