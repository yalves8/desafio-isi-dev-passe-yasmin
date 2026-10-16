import { describe, expect, it } from 'vitest';
import { isLineupComplete } from '../domain/formation.js';

describe('escalação completa (RN19)', () => {
  it('exige a formação salva e os 5 titulares', () => {
    expect(isLineupComplete('2-1-1', 5)).toBe(true);
    expect(isLineupComplete('2-1-1', 4)).toBe(false);
    expect(isLineupComplete(null, 0)).toBe(false);
  });
});
