import { BadRequestException } from '@nestjs/common';
import { parseQueryPlayers } from './query-players.dto.js';

describe('parseQueryPlayers: search (V4)', () => {
  it('remove os espaços das pontas e junta os repetidos antes de buscar', () => {
    expect(parseQueryPlayers({ search: '  davi   melo ' }).search).toBe(
      'davi melo',
    );
  });

  it.each(['  ', ' a '])(
    'recusa com 400 o texto que fica com menos de 2 caracteres (%j)',
    (search) => {
      expect(() => parseQueryPlayers({ search })).toThrow(BadRequestException);
    },
  );

  it('recusa com 400 caracteres de controle', () => {
    expect(() => parseQueryPlayers({ search: 'da\tvi' })).toThrow(
      BadRequestException,
    );
  });

  it('conta o tamanho em caracteres, não em unidades UTF-16', () => {
    expect(parseQueryPlayers({ search: '𝒜𝒜' }).search).toBe('𝒜𝒜');
  });
});
