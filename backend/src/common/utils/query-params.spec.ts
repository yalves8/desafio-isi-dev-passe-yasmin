import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import {
  parsePositiveInt,
  parseQueryId,
  rejectEmptyParams,
} from './query-params.js';

describe('rejectEmptyParams', () => {
  it('deixa passar parâmetros ausentes e preenchidos', () => {
    expect(() => rejectEmptyParams({ a: '1', b: undefined })).not.toThrow();
  });

  it('recusa o primeiro parâmetro vazio, na ordem recebida', () => {
    expect(() => rejectEmptyParams({ a: '1', b: '', c: '' })).toThrow(
      new BadRequestException('Parâmetro b não pode ser vazio'),
    );
  });
});

describe('parsePositiveInt', () => {
  it('converte inteiros positivos sem zeros à esquerda', () => {
    expect(parsePositiveInt('page', '12')).toBe(12);
  });

  it.each(['0', '-1', '01', '1.0', '1e2', 'abc'])('recusa %j', (value) => {
    expect(() => parsePositiveInt('page', value)).toThrow(
      new BadRequestException('page deve ser um inteiro positivo'),
    );
  });
});

describe('parseQueryId', () => {
  it('aceita até 2.147.483.647', () => {
    expect(parseQueryId('club_id', '2147483647')).toBe(2147483647);
  });

  it('recusa o formato inválido e o id acima do limite com a mesma mensagem por padrão', () => {
    for (const value of ['01', '2147483648']) {
      expect(() => parseQueryId('club_id', value)).toThrow(
        new BadRequestException('club_id deve ser um inteiro positivo'),
      );
    }
  });

  it('usa a mensagem própria para o id acima do limite quando informada', () => {
    expect(() =>
      parseQueryId('club_id', '2147483648', 'club_id excede o limite'),
    ).toThrow(new BadRequestException('club_id excede o limite'));
    expect(() =>
      parseQueryId('club_id', '0', 'club_id excede o limite'),
    ).toThrow(new BadRequestException('club_id deve ser um inteiro positivo'));
  });
});
