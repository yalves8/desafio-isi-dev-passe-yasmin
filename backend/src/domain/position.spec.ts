import { describe, expect, it } from 'vitest';
import { comparePositions, Position, POSITIONS } from './position.js';

describe('posição', () => {
  it('lista as posições na ordem oficial, de trás para frente (RN11)', () => {
    expect(POSITIONS).toEqual(['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']);
  });

  it('ordena pela ordem oficial', () => {
    const shuffled: Position[] = ['ATA', 'GOL', 'MEI', 'LAT', 'ZAG'];
    expect(shuffled.sort(comparePositions)).toEqual([
      'GOL',
      'ZAG',
      'LAT',
      'MEI',
      'ATA',
    ]);
  });

  it('empata posições iguais', () => {
    expect(comparePositions('MEI', 'MEI')).toBe(0);
  });
});
