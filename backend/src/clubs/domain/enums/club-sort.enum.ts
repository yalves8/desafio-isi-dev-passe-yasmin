import { compareNames } from '../../../common/utils/text.js';

/**
 * Critérios oficiais de ordenação para a listagem de clubes da liga (RN11).
 *
 * @export
 * @enum {string}
 */
export enum ClubSortEnum {
  NAME = 'name',
  NET_WORTH_ASC = 'net_worth_asc',
  NET_WORTH_DESC = 'net_worth_desc',
}

/**
 * Compara dois clubes de acordo com as regras de ordenação e desempate da RN11:
 * 1. Critério primário: por patrimônio líquido se 'net_worth_desc' ou 'net_worth_asc'.
 * 2. Desempate obrigatório: nome do clube em ordem alfabética (insensível a acentos e maiúsculas).
 * 3. Desempate final: ID do clube em ordem crescente.
 *
 * @param {{ id: number; name: string; netWorth: number }} a - Primeiro clube a comparar.
 * @param {{ id: number; name: string; netWorth: number }} b - Segundo clube a comparar.
 * @param {ClubSortEnum | string} [sort=ClubSortEnum.NAME] - Critério de ordenação selecionado.
 * @returns {number} Valor numérico de ordenação (-1, 0, 1).
 */
export function compareClubsBySortCriteria<
  T extends { id: number; name: string; netWorth: number },
>(a: T, b: T, sort: ClubSortEnum | string = ClubSortEnum.NAME): number {
  if (sort === ClubSortEnum.NET_WORTH_DESC) {
    const diff = b.netWorth - a.netWorth;
    if (diff !== 0) return diff;
  } else if (sort === ClubSortEnum.NET_WORTH_ASC) {
    const diff = a.netWorth - b.netWorth;
    if (diff !== 0) return diff;
  }

  const nameDiff = compareNames(a.name, b.name);
  if (nameDiff !== 0) return nameDiff;

  return a.id - b.id;
}
