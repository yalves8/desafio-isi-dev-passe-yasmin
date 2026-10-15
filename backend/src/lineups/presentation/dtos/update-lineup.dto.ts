import { z } from 'zod';
import { FORMATION_VALUES, LINEUP_SIZE } from '../../domain/formation.js';

const MAX_ID = 2_147_483_647;

/**
 * Schema Zod do corpo da escalação (PUT /api/v1/clubs/{id}/lineup).
 *
 * Regras aplicadas (V2, V5, V6 e RN19):
 * - `formation`: `3-1`, `2-2`, `2-1-1` ou `1-2-1`, escrita exatamente assim.
 * - `player_ids`: lista com exatamente 5 ids inteiros positivos e distintos.
 * Campos a mais são ignorados (V7).
 */
export const updateLineupSchema = z.object({
  formation: z.enum(FORMATION_VALUES, {
    error: 'formation deve ser 3-1, 2-2, 2-1-1 ou 1-2-1',
  }),
  player_ids: z
    .array(
      z
        .number({ error: 'player_ids deve ter só inteiros positivos' })
        .int({ error: 'player_ids deve ter só inteiros positivos' })
        .positive({ error: 'player_ids deve ter só inteiros positivos' })
        .max(MAX_ID, { error: 'player_ids deve ter só inteiros positivos' }),
      { error: 'player_ids é obrigatório e deve ser uma lista' },
    )
    .length(LINEUP_SIZE, {
      error: `player_ids deve ter exatamente ${LINEUP_SIZE} jogadores`,
    })
    .refine((ids) => new Set(ids).size === ids.length, {
      error: 'player_ids não pode repetir jogadores',
    }),
});

export type UpdateLineupDto = z.infer<typeof updateLineupSchema>;
