import { compareNames } from '../../common/utils/text.js';
import { Money } from '../../domain/money.js';

/** O que a ordenação da listagem usa de cada clube */
interface SortableClub {
  id: number;
  name: string;
  netWorth: Money;
}

/**
 * Critérios oficiais de ordenação da listagem de clubes (RN11), fonte única do domínio e da
 * validação da query. `name` não tem critério primário: vai direto ao desempate.
 */
export const CLUB_SORTS = {
  name: { compare: () => 0 },
  net_worth_asc: {
    compare: (a: SortableClub, b: SortableClub) =>
      a.netWorth.compareTo(b.netWorth),
  },
  net_worth_desc: {
    compare: (a: SortableClub, b: SortableClub) =>
      b.netWorth.compareTo(a.netWorth),
  },
} as const satisfies Record<
  string,
  { compare: (a: SortableClub, b: SortableClub) => number }
>;

/** Critério de ordenação aceito: uma das chaves de `CLUB_SORTS` */
export type ClubSortCriteria = keyof typeof CLUB_SORTS;

/** Critério usado quando a query não informa `sort` */
export const DEFAULT_CLUB_SORT: ClubSortCriteria = 'name';

/** Diz se o texto é um critério de ordenação de clubes (só as chaves próprias do mapa) */
export function isClubSortCriteria(value: string): value is ClubSortCriteria {
  return Object.hasOwn(CLUB_SORTS, value);
}

/**
 * Compara dois clubes de acordo com as regras de ordenação e desempate da RN11:
 * 1. Critério primário: por patrimônio líquido se 'net_worth_desc' ou 'net_worth_asc'.
 * 2. Desempate obrigatório: nome do clube em ordem alfabética (insensível a acentos e maiúsculas).
 * 3. Desempate final: ID do clube em ordem crescente.
 *
 * @param {SortableClub} a - Primeiro clube a comparar.
 * @param {SortableClub} b - Segundo clube a comparar.
 * @param {ClubSortCriteria} [sort='name'] - Critério de ordenação selecionado.
 * @returns {number} Valor numérico de ordenação.
 */
export function compareClubsBySortCriteria<T extends SortableClub>(
  a: T,
  b: T,
  sort: ClubSortCriteria = DEFAULT_CLUB_SORT,
): number {
  return (
    CLUB_SORTS[sort].compare(a, b) ||
    compareNames(a.name, b.name) ||
    a.id - b.id
  );
}
