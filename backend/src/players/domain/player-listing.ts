import { compareNames, removeAccents } from '../../common/utils/text.js';
import { comparePositions, Position } from '../../domain/position.js';

/** O que a busca, os filtros de valor e a ordenação da listagem usam de cada jogador */
export interface ListedPlayer {
  id: number;
  name: string;
  age: number;
  position: Position;
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

/** Um critério de ordenação: o campo base (que não pode se repetir no `sort`) e a comparação */
interface PlayerSort {
  field: 'name' | 'value' | 'age' | 'position';
  compare: (a: ListedPlayer, b: ListedPlayer) => number;
}

/**
 * Critérios de ordenação da listagem (RN07), fonte única do domínio e da validação da query.
 * Até dois por vez; o segundo desempata o primeiro.
 */
export const PLAYER_SORTS = {
  name: { field: 'name', compare: (a, b) => compareNames(a.name, b.name) },
  value_asc: {
    field: 'value',
    compare: (a, b) => a.marketValue - b.marketValue,
  },
  value_desc: {
    field: 'value',
    compare: (a, b) => b.marketValue - a.marketValue,
  },
  age_asc: { field: 'age', compare: (a, b) => a.age - b.age },
  age_desc: { field: 'age', compare: (a, b) => b.age - a.age },
  position: {
    field: 'position',
    compare: (a, b) => comparePositions(a.position, b.position),
  },
} as const satisfies Record<string, PlayerSort>;

/** Critério de ordenação aceito: uma das chaves de `PLAYER_SORTS` */
export type PlayerSortCriteria = keyof typeof PLAYER_SORTS;

/** Diz se o texto é um critério de ordenação de jogadores (só as chaves próprias do mapa) */
export function isPlayerSortCriteria(
  value: string,
): value is PlayerSortCriteria {
  return Object.hasOwn(PLAYER_SORTS, value);
}

/** RN07: ordena pelos critérios pedidos; o empate é desfeito pelo nome e depois pelo id */
export function comparePlayers(criteria: PlayerSortCriteria[]) {
  return (a: ListedPlayer, b: ListedPlayer): number => {
    for (const criterion of criteria) {
      const diff = PLAYER_SORTS[criterion].compare(a, b);
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
