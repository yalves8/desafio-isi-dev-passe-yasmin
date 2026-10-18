import { z } from 'zod';
import { CONDITIONS } from '../../../domain/condition.js';

/**
 * Schema Zod de validação do payload HTTP para alteração da condição física (PATCH /api/v1/players/{id}/condition).
 */
export const updateConditionSchema = z.object({
  condition: z.enum(CONDITIONS, {
    error: 'Condição inválida',
  }),
});

export type UpdateConditionDto = z.infer<typeof updateConditionSchema>;
