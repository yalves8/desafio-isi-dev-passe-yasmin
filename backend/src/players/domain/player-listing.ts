import { compareNames, removeAccents } from '../../common/utils/text.js';
import { comparePositions } from '../../domain/enums/position.enum.js';

/** Critérios de ordenação da listagem (RN07); até dois, o segundo desempata o primeiro */
export type PlayerSortCriteria =
  'name' | 'value_asc' | 'value_desc' | 'age_asc' | 'age_desc' | 'position';

/** O que a busca, os filtros de valor e a ordenação da listagem usam de cada jogador */
export interface ListedPlayer {
  id: number;
  name: string;
  age: number;
  position: string;
  marketValue: number;
}

/** RN07: busca no nome, sem diferenciar maiúsculas, minúsculas e acentos */
export function matchesSearch(name: string, search: string): boolean {
  return removeAccents(name)
    .toLowerCase()
    .includes(removeAccents(search).toLowerCase());
}

/** RN07: faixa de valor de mercado inclusiva; limite ausente não filtra */
export function isWithinValueRange(
  marketValue: number,
  min?: number,
  max?: number,
): boolean {
  return (
    (min === undefined || marketValue >= min) &&
    (max === undefined || marketValue <= max)
  );
}

function compareBy(
  criteria: PlayerSortCriteria,
  a: ListedPlayer,
  b: ListedPlayer,
): number {
  switch (criteria) {
    case 'name':
      return compareNames(a.name, b.name);
    case 'value_asc':
      return a.marketValue - b.marketValue;
    case 'value_desc':
      return b.marketValue - a.marketValue;
    case 'age_asc':
      return a.age - b.age;
    case 'age_desc':
      return b.age - a.age;
    case 'position':
      return comparePositions(a.position, b.position);
  }
}

/** RN07: ordena pelos critérios pedidos; o empate é desfeito pelo nome e depois pelo id */
export function comparePlayers(criteria: PlayerSortCriteria[]) {
  return (a: ListedPlayer, b: ListedPlayer): number => {
    for (const criterion of criteria) {
      const diff = compareBy(criterion, a, b);
      if (diff !== 0) return diff;
    }
    return compareNames(a.name, b.name) || a.id - b.id;
  };
}

/** RN07: a página é aplicada depois de buscar, filtrar e ordenar; página além da última vem vazia */
export function paginate<T>(items: T[], page: number, limit: number) {
  const offset = (page - 1) * limit;
  return {
    items: items.slice(offset, offset + limit),
    totalItems: items.length,
    totalPages: Math.ceil(items.length / limit),
  };
}
