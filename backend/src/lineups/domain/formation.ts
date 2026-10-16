import { Position } from '../../domain/player-rating.js';

/** Formações aceitas (RN19): jogadores de linha por setor, de trás para frente, sem o goleiro */
export const FORMATIONS = {
  '3-1': { DEF: 3, MID: 0, ATT: 1 },
  '2-2': { DEF: 2, MID: 0, ATT: 2 },
  '2-1-1': { DEF: 2, MID: 1, ATT: 1 },
  '1-2-1': { DEF: 1, MID: 2, ATT: 1 },
} as const;

export type Formation = keyof typeof FORMATIONS;
export const FORMATION_VALUES = Object.keys(FORMATIONS) as Formation[];

/** Titulares de uma escalação completa: 1 goleiro e 4 jogadores de linha */
export const LINEUP_SIZE = 5;

/** RN19: a escalação está completa com a formação salva e os 5 titulares; só assim o clube joga */
export function isLineupComplete(
  formation: Formation | null,
  startersCount: number,
): boolean {
  return formation !== null && startersCount === LINEUP_SIZE;
}

type Sector = 'GK' | 'DEF' | 'MID' | 'ATT';

/** Setor de cada posição: ZAG e LAT são defesa, MEI é meio e ATA é ataque */
function sectorOf(position: Position): Sector {
  if (position === 'GOL') return 'GK';
  if (position === 'MEI') return 'MID';
  if (position === 'ATA') return 'ATT';
  return 'DEF';
}

/**
 * As posições fecham a formação quando há 1 GOL e, em cada setor, a quantidade da tabela.
 *
 * @param {Formation} formation - Formação pedida.
 * @param {Position[]} positions - Posições dos 5 titulares.
 * @returns {boolean} true se fecharem a formação.
 */
export function fitsFormation(
  formation: Formation,
  positions: Position[],
): boolean {
  const count = { GK: 0, DEF: 0, MID: 0, ATT: 0 };
  for (const position of positions) count[sectorOf(position)]++;
  const expected = FORMATIONS[formation];
  return (
    count.GK === 1 &&
    count.DEF === expected.DEF &&
    count.MID === expected.MID &&
    count.ATT === expected.ATT
  );
}

/** Texto do que a formação exige (ex.: "1 GOL, 2 entre ZAG e LAT, 1 MEI e 1 ATA") */
export function formationRequirement(formation: Formation): string {
  const { DEF, MID, ATT } = FORMATIONS[formation];
  const parts = ['1 GOL', `${DEF} entre ZAG e LAT`];
  if (MID > 0) parts.push(`${MID} MEI`);
  parts.push(`${ATT} ATA`);
  return `${parts.slice(0, -1).join(', ')} e ${parts.at(-1)}`;
}
