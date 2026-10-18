import { describe, expect, it } from 'vitest';
import { Money } from '../../domain/money.js';
import { clubFromRow } from '../infrastructure/mappers/club.mapper.js';

describe('clubFromRow', () => {
  it('converte a linha de clubes na entidade, com o caixa decimal em Money', () => {
    const criado = new Date('2026-01-01T00:00:00Z');
    const club = clubFromRow({
      id: 7,
      nome: 'Águias FC',
      nome_normalizado: 'águias fc',
      sigla: 'AGU',
      caixa: { toString: () => '261.15' },
      criado_em: criado,
    });

    expect(club.id).toBe(7);
    expect(club.name).toBe('Águias FC');
    expect(club.normalizedName).toBe('águias fc');
    expect(club.acronym).toBe('AGU');
    expect(club.getCash()).toEqual(Money.ofCents(26115));
    expect(club.createdAt).toBe(criado);
  });
});
