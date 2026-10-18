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

describe('parseQueryPlayers: mensagens e ordem de validação', () => {
  const message = (query: Record<string, string>): string => {
    try {
      parseQueryPlayers(query);
    } catch (error) {
      return (error as BadRequestException).message;
    }
    throw new Error('esperava 400');
  };

  it('usa os padrões quando nada é enviado', () => {
    expect(parseQueryPlayers({})).toEqual({
      search: undefined,
      position: undefined,
      condition: undefined,
      free: undefined,
      clubId: undefined,
      minAge: undefined,
      maxAge: undefined,
      minValue: undefined,
      maxValue: undefined,
      sort: ['name'],
      page: 1,
      limit: 10,
    });
  });

  it('converte todos os filtros válidos', () => {
    expect(
      parseQueryPlayers({
        position: 'ATA',
        condition: 'DOENTE',
        free: 'false',
        club_id: '2147483647',
        min_age: '16',
        max_age: '45',
        min_value: '0',
        max_value: '550.00',
        sort: 'value_desc,age_asc',
        page: '3',
        limit: '50',
      }),
    ).toEqual({
      search: undefined,
      position: 'ATA',
      condition: 'DOENTE',
      free: false,
      clubId: 2147483647,
      minAge: 16,
      maxAge: 45,
      minValue: 0,
      maxValue: 550,
      sort: ['value_desc', 'age_asc'],
      page: 3,
      limit: 50,
    });
  });

  it.each([
    [{ page: '1', search: '' }, 'Parâmetro search não pode ser vazio'],
    [{ position: 'XX' }, 'Posição inválida no filtro'],
    [{ condition: 'apto' }, 'Condição inválida no filtro'],
    [{ free: '1' }, 'free deve ser true ou false'],
    [{ club_id: '01' }, 'club_id deve ser um inteiro positivo'],
    [{ club_id: '2147483648' }, 'club_id excede o limite'],
    [
      { free: 'true', club_id: '1' },
      'free=true não pode ser combinado com club_id',
    ],
    [{ min_age: '-1' }, 'min_age deve ser um inteiro positivo'],
    [{ min_age: '15' }, 'min_age deve estar entre 16 e 45'],
    [{ max_age: '1.5' }, 'max_age deve ser um inteiro positivo'],
    [{ max_age: '46' }, 'max_age deve estar entre 16 e 45'],
    [
      { min_age: '30', max_age: '20' },
      'min_age não pode ser maior que max_age',
    ],
    [
      { min_value: '1.234' },
      'min_value deve ser um número decimal válido com até 2 casas',
    ],
    [{ min_value: '550.01' }, 'min_value deve estar entre 0 e 550'],
    [
      { max_value: '01' },
      'max_value deve ser um número decimal válido com até 2 casas',
    ],
    [{ max_value: '551' }, 'max_value deve estar entre 0 e 550'],
    [
      { min_value: '10', max_value: '9.99' },
      'min_value não pode ser maior que max_value',
    ],
    [{ sort: 'name,age_asc,position' }, 'sort aceita no máximo 2 critérios'],
    [{ sort: 'idade' }, 'Critério de ordenação inválido: idade'],
    [
      { sort: 'value_asc,value_desc' },
      'Não é permitido repetir o mesmo campo na ordenação',
    ],
    [
      { sort: 'name,name' },
      'Não é permitido repetir o mesmo campo na ordenação',
    ],
    [{ page: '0' }, 'page deve ser um inteiro positivo'],
    [{ limit: 'x' }, 'limit deve ser um inteiro positivo'],
    [{ limit: '51' }, 'limit deve estar entre 1 e 50'],
    // A ordem das checagens decide qual erro aparece primeiro.
    [{ limit: '51', min_age: '10' }, 'min_age deve estar entre 16 e 45'],
    [{ max_age: '50', min_age: '10' }, 'min_age deve estar entre 16 e 45'],
    [
      { max_value: '600', min_value: '600' },
      'min_value deve estar entre 0 e 550',
    ],
    [{ sort: 'x', position: 'x' }, 'Posição inválida no filtro'],
  ])('recusa %j com "%s"', (query, expected) => {
    expect(message(query)).toBe(expected);
  });
});
