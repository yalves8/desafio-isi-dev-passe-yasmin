import { describe, expect, it } from 'vitest';
import { Money } from '../../domain/money.js';
import {
  CLUB_SORTS,
  compareClubsBySortCriteria,
  isClubSortCriteria,
} from '../domain/club-sort.js';

const club = (id: number, name: string, netWorth: number) => ({
  id,
  name,
  netWorth: Money.fromDecimal(netWorth),
});

describe('ordenação de clubes (RN11)', () => {
  const clubs = [
    club(3, 'Beta', 200),
    club(1, 'Álamo', 300),
    club(2, 'alamo', 300),
    club(4, 'Gama', 100),
  ];
  const order = (sort?: Parameters<typeof compareClubsBySortCriteria>[2]) =>
    [...clubs]
      .sort((a, b) => compareClubsBySortCriteria(a, b, sort))
      .map((c) => c.id);

  it('aceita só os três critérios', () => {
    expect(Object.keys(CLUB_SORTS)).toEqual([
      'name',
      'net_worth_asc',
      'net_worth_desc',
    ]);
    expect(isClubSortCriteria('net_worth_asc')).toBe(true);
    expect(isClubSortCriteria('net_worth')).toBe(false);
    expect(isClubSortCriteria('constructor')).toBe(false);
  });

  it('ordena por nome e desempata por id; name é o padrão', () => {
    expect(order('name')).toEqual([1, 2, 3, 4]);
    expect(order()).toEqual([1, 2, 3, 4]);
  });

  it('ordena por patrimônio e desempata por nome e id', () => {
    expect(order('net_worth_asc')).toEqual([4, 3, 1, 2]);
    expect(order('net_worth_desc')).toEqual([1, 2, 3, 4]);
  });
});
