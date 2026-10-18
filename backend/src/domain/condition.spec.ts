import { describe, expect, it } from 'vitest';
import {
  canChangeCondition,
  CONDITION_RULES,
  CONDITIONS,
} from './condition.js';

describe('condição física', () => {
  it('lista as três condições na ordem oficial', () => {
    expect(CONDITIONS).toEqual(['APTO', 'MAL_CONDICIONADO', 'DOENTE']);
  });

  it('só DOENTE fica fora da escalação (RN19)', () => {
    expect(CONDITIONS.filter((c) => !CONDITION_RULES[c].canStart)).toEqual([
      'DOENTE',
    ]);
    expect(CONDITIONS.filter((c) => CONDITION_RULES[c].leavesLineup)).toEqual([
      'DOENTE',
    ]);
  });

  it('só MAL_CONDICIONADO joga com 85% do atributo (RN20)', () => {
    expect(CONDITION_RULES.APTO.duelFactorPercent).toBe(100);
    expect(CONDITION_RULES.MAL_CONDICIONADO.duelFactorPercent).toBe(85);
    expect(CONDITION_RULES.DOENTE.duelFactorPercent).toBe(100);
  });

  it.each(CONDITIONS.flatMap((from) => CONDITIONS.map((to) => [from, to])))(
    'de %s para %s só é proibido de DOENTE para APTO',
    (from, to) => {
      expect(canChangeCondition(from, to)).toBe(
        !(from === 'DOENTE' && to === 'APTO'),
      );
    },
  );
});
