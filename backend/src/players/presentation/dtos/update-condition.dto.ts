import { z } from 'zod';

export const CONDITIONS = ['APTO', 'MAL_CONDICIONADO', 'DOENTE'] as const;

/**
 * Schema Zod de validação do payload HTTP para alteração da condição física (PATCH /api/v1/players/{id}/condition).
 */
export const updateConditionSchema = z.object({
  condition: z.enum(CONDITIONS, {
    error: 'Condição inválida',
  }),
});

export type UpdateConditionDto = z.infer<typeof updateConditionSchema>;
