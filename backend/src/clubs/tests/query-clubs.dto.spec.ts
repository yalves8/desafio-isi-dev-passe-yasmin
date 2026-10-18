import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { parseQueryClubs } from '../presentation/dtos/query-clubs.dto.js';

describe('parseQueryClubs', () => {
  it('usa name como padrão e aceita os três critérios', () => {
    expect(parseQueryClubs({})).toEqual({ sort: 'name' });
    for (const sort of ['name', 'net_worth_asc', 'net_worth_desc']) {
      expect(parseQueryClubs({ sort })).toEqual({ sort });
    }
  });

  it.each([
    [{ sort: '' }, 'Parâmetro sort não pode ser vazio'],
    [{ outro: '' }, 'Parâmetro outro não pode ser vazio'],
    [{ sort: 'net_worth' }, 'Critério de ordenação inválido para clubes'],
    [
      { sort: 'name,net_worth_asc' },
      'Critério de ordenação inválido para clubes',
    ],
  ])('recusa %j com "%s"', (query, expected) => {
    expect(() => parseQueryClubs(query)).toThrow(
      new BadRequestException(expected),
    );
  });
});
