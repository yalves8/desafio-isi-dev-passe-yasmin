import { z } from 'zod';
import {
  containsControlChars,
  charCount,
  normalizeSpaces,
} from '../../../common/utils/text.js';
import { POSITIONS } from '../../../domain/position.js';

/**
 * Nome do jogador (V4): sem caracteres de controle, espaços normalizados,
 * 3 a 100 caracteres, sem dígitos e com pelo menos duas palavras.
 */
export const playerNameSchema = z
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
  );

/**
 * Campos cadastrais comuns ao cadastro e à atualização (RN06/RN08):
 * nome, posição, agilidade (1 a 100) e idade (16 a 45).
 */
export const playerProfileFields = {
  name: playerNameSchema,
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
};

/**
 * Regra cruzada do veterano: com 35 anos ou mais, a agilidade é no máximo 85.
 *
 * @param {{ age: number; agility: number }} data - Idade e agilidade já validadas.
 * @param {z.RefinementCtx} ctx - Contexto do `superRefine`, onde a falha é registrada em `agility`.
 */
export function veteranAgilityRule(
  data: { age: number; agility: number },
  ctx: z.RefinementCtx,
): void {
  if (data.age >= 35 && data.agility > 85) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Jogador com 35 anos ou mais pode ter agilidade de no máximo 85',
      path: ['agility'],
    });
  }
}
