import { z } from 'zod';

const MAX_ID = 2_147_483_647;

const clubId = (field: string) =>
  z
    .number({ error: `${field} é obrigatório e deve ser um inteiro` })
    .int({ error: `${field} deve ser um inteiro` })
    .positive({ error: `${field} deve ser um inteiro positivo` })
    .max(MAX_ID, { error: `${field} deve ser um inteiro positivo` });

/**
 * Schema Zod do corpo da partida (POST /api/v1/matches).
 *
 * Regras aplicadas (V2, V6 e RN20): `home_club_id` e `away_club_id` inteiros positivos e
 * diferentes entre si (400). Campos a mais são ignorados (V7).
 */
export const playMatchSchema = z
  .object({
    home_club_id: clubId('home_club_id'),
    away_club_id: clubId('away_club_id'),
  })
  .refine((body) => body.home_club_id !== body.away_club_id, {
    error: 'O mandante e o visitante precisam ser clubes diferentes',
  });

export type PlayMatchDto = z.infer<typeof playMatchSchema>;
