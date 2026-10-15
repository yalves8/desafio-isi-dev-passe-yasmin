import { z } from 'zod';
import {
  containsControlChars,
  charCount,
  normalizeSpaces,
} from '../../../common/utils/text.js';
import { POSITIONS } from './create-player.dto.js';

/**
 * Schema Zod de validação do payload HTTP para atualização cadastral de jogador (PUT /api/v1/players/{id}).
 *
 * Exige todos os 4 campos principais (RN08), mesmo que apenas um deles seja alterado.
 */
export const updatePlayerSchema = z
  .object({
    name: z
      .string({ error: 'name é obrigatório' })
      .refine((v) => !containsControlChars(v), {
        message: 'Caracteres de controle não são permitidos no nome',
      })
      .transform((v) => normalizeSpaces(v))
      .refine((v) => charCount(v) >= 3 && charCount(v) <= 100, {
        message: 'Nome deve ter entre 3 e 100 caracteres',
      })
      .refine((v) => !/\d/.test(v), {
        message: 'Nome não pode conter dígitos',
      })
      .refine(
        (v) => {
          const words = v.split(' ').filter((w) => /\p{L}/u.test(w));
          return words.length >= 2;
        },
        {
          message: 'Nome deve ter pelo menos duas palavras',
        },
      ),
    position: z.enum(POSITIONS, {
      error: 'Posição inválida',
    }),
    agility: z
      .number({ error: 'agility é obrigatório' })
      .int('Agilidade deve ser um número inteiro')
      .min(1, 'Agilidade deve ser no mínimo 1')
      .max(100, 'Agilidade deve ser no máximo 100'),
    age: z
      .number({ error: 'age é obrigatório' })
      .int('Idade deve ser um número inteiro')
      .min(16, 'Idade deve ser no mínimo 16')
      .max(45, 'Idade deve ser no máximo 45'),
  })
  .superRefine((data, ctx) => {
    if (data.age >= 35 && data.agility > 85) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Jogador com 35 anos ou mais pode ter agilidade de no máximo 85',
        path: ['agility'],
      });
    }
  });

export type UpdatePlayerDto = z.infer<typeof updatePlayerSchema>;
