import { describe, expect, it } from 'vitest';
import {
  comparePlayers,
  isWithinValueRange,
  ListedPlayer,
  matchesSearch,
  paginate,
} from '../domain/player-listing.js';

const player = (
  id: number,
  name: string,
  overrides: Partial<ListedPlayer> = {},
): ListedPlayer => ({
  id,
  name,
  age: 25,
  position: 'MEI',
  marketValue: 10,
  ...overrides,
});

describe('listagem de jogadores (RN07)', () => {
  it('busca no nome sem diferenciar maiúsculas, minúsculas e acentos', () => {
    expect(matchesSearch('João Silva', 'joao')).toBe(true);
    expect(matchesSearch('Meia Lua', 'LUA')).toBe(true);
    expect(matchesSearch('Meia Lua', 'sol')).toBe(false);
  });

  it('filtra a faixa de valor inclusiva; limite ausente não filtra', () => {
    expect(isWithinValueRange(30, 30, 50)).toBe(true);
    expect(isWithinValueRange(50, 30, 50)).toBe(true);
    expect(isWithinValueRange(50.01, 30, 50)).toBe(false);
    expect(isWithinValueRange(500, 30)).toBe(true);
    expect(isWithinValueRange(1)).toBe(true);
  });

  it('ordena por dois critérios e desempata pelo nome e depois pelo id', () => {
    const players = [
      player(3, 'Bruno', { age: 30, marketValue: 20 }),
      player(1, 'Ana Lima', { age: 30, marketValue: 20 }),
      player(2, 'Ana-Maria', { age: 22, marketValue: 20 }),
      player(4, 'Ana Lima', { age: 30, marketValue: 20 }),
    ];

    const byValueThenAge = [...players].sort(
      comparePlayers(['value_desc', 'age_asc']),
    );
    expect(byValueThenAge.map((p) => p.id)).toEqual([2, 1, 4, 3]);
  });

  it('ordena por posição na ordem GOL, ZAG, LAT, MEI, ATA', () => {
    const players = [
      player(1, 'A', { position: 'ATA' }),
      player(2, 'B', { position: 'GOL' }),
      player(3, 'C', { position: 'LAT' }),
    ];
    expect(
      [...players].sort(comparePlayers(['position'])).map((p) => p.position),
    ).toEqual(['GOL', 'LAT', 'ATA']);
  });

  it.each([
    [23, 10, 1, 10, 3],
    [23, 10, 3, 3, 3],
    [23, 10, 4, 0, 3],
    [23, 50, 1, 23, 1],
    [0, 10, 1, 0, 0],
  ])(
    '%i itens, limit %i, page %i → %i na página, %i páginas',
    (total, limit, page, inPage, pages) => {
      const result = paginate(
        Array.from({ length: total }, (_, i) => i),
        page,
        limit,
      );
      expect(result.items).toHaveLength(inPage);
      expect(result.totalItems).toBe(total);
      expect(result.totalPages).toBe(pages);
    },
  );
});
