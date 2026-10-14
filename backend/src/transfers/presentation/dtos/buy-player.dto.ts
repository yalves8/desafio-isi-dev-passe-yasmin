import { z } from 'zod';
import { parseBrasiliaDateTime } from '../../../common/utils/date.js';

/**
 * Schema Zod do corpo da compra (POST /api/v1/players/{id}/buy).
 *
 * Regras aplicadas (V2, V6 e RN01):
 * - `club_id`: inteiro positivo (0 ou negativo → 400; texto → 400).
 * - `loyalty_until`: data e hora no formato `AAAA-MM-DDTHH:MM-03:00`; data inexistente → 400.
 *   A janela (depois da compra e até 1.095 dias) depende do relógio do servidor e fica no caso de uso.
 * Campos a mais são ignorados (V7).
 */
export const buyPlayerSchema = z.object({
  club_id: z
    .number({ error: 'club_id é obrigatório e deve ser um inteiro' })
    .int({ error: 'club_id deve ser um inteiro' })
    .positive({ error: 'club_id deve ser um inteiro positivo' }),
  loyalty_until: z
    .string({ error: 'loyalty_until é obrigatório' })
    .transform((value, ctx) => {
      const date = parseBrasiliaDateTime(value);
      if (!date) {
        ctx.addIssue({
          code: 'custom',
          message:
            'loyalty_until deve ser uma data e hora existente no formato AAAA-MM-DDTHH:MM-03:00',
        });
        return z.NEVER;
      }
      return date;
    }),
});

export type BuyPlayerDto = z.infer<typeof buyPlayerSchema>;
