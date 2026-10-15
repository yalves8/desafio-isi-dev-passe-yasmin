import { z } from 'zod';
import {
  containsControlChars,
  isSubsequence,
  charCount,
  normalizeSpaces,
  removeAccents,
} from '../../../common/utils/text.js';

/**
 * Schema Zod de validação do payload HTTP para cadastro de clube (POST /api/v1/clubs).
 *
 * Regras aplicadas (conforme V4 e RN10):
 * - Nome: 3 a 60 caracteres após normalização V4 (espaços limpos, sem caracteres de controle).
 * - Palavras do nome: entre 2 e 5 palavras contendo letras.
 * - Caracteres aceitos no nome: apenas letras, espaços, hífen e ponto.
 * - Sigla: exatamente 3 letras maiúsculas de A a Z.
 * - Restrições da sigla: letras não podem ser todas iguais; primeira letra deve ser a inicial do nome;
 *   e as letras devem formar uma subsequência ordenada do nome.
 */
export const createClubSchema = z
  .object({
    name: z
      .string({ error: 'name é obrigatório' })
      .refine((v) => !containsControlChars(v), {
        message: 'Caracteres de controle não são permitidos no nome',
      })
      .transform((v) => normalizeSpaces(v))
      .refine((v) => charCount(v) >= 3 && charCount(v) <= 60, {
        message: 'Nome do clube deve ter entre 3 e 60 caracteres',
      })
      .refine(
        (v) => {
          const words = v.split(' ').filter((w) => /\p{L}/u.test(w));
          return words.length >= 2 && words.length <= 5;
        },
        {
          message: 'Nome do clube deve ter entre 2 e 5 palavras',
        },
      )
      .refine((v) => /^[\p{L} \-.]+$/u.test(v), {
        message: 'Nome do clube aceita apenas letras, espaços, hífen e ponto',
      }),
    acronym: z
      .string({ error: 'acronym é obrigatório' })
      .regex(
        /^[A-Z]{3}$/,
        'Sigla deve conter exatamente 3 letras maiúsculas de A a Z',
      ),
  })
  .superRefine((data, ctx) => {
    if (
      data.acronym[0] === data.acronym[1] &&
      data.acronym[1] === data.acronym[2]
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'As três letras da sigla não podem ser todas iguais',
        path: ['acronym'],
      });
      return;
    }

    const normalizedName = removeAccents(data.name).toUpperCase();
    const firstLetterName = normalizedName.match(/\p{L}/u)?.[0];
    if (data.acronym[0] !== firstLetterName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'A primeira letra da sigla deve ser a primeira letra do nome do clube',
        path: ['acronym'],
      });
      return;
    }

    if (!isSubsequence(data.acronym, normalizedName)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'As letras da sigla devem aparecer no nome do clube na mesma ordem',
        path: ['acronym'],
      });
    }
  });

/**
 * Tipo inferido do schema de criação de clube.
 */
export type CreateClubDto = z.infer<typeof createClubSchema>;
