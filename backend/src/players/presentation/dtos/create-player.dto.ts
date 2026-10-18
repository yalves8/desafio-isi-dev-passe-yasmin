import { z } from 'zod';
import {
  playerProfileFields,
  veteranAgilityRule,
} from './player-fields.schema.js';

/**
 * Schema Zod de validação do payload HTTP para cadastro de jogador (POST /api/v1/players).
 *
 * Regras aplicadas (conforme RN06 e V4):
 * - Nome: 3 a 100 caracteres após normalização V4, sem dígitos, pelo menos 2 palavras.
 * - Posição: enum 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA'.
 * - Agilidade: 1 a 100 (se idade >= 35, agilidade máxima permitida é 85).
 * - Idade: 16 a 45 anos.
 * - Atributos técnicos: 1 a 99 cada, e a soma dos seis não pode ultrapassar 480.
 * - Potencial: 1 a 99, maior ou igual ao maior dos seis atributos técnicos.
 *   (Se idade >= 33 no cadastro, potencial deve ser exatamente igual ao maior atributo).
 */
export const createPlayerSchema = z
  .object({
    ...playerProfileFields,
    pace: z
      .number({ error: 'pace é obrigatório' })
      .int('pace deve ser um número inteiro')
      .min(1, 'Atributo deve ser entre 1 e 99')
      .max(99, 'Atributo deve ser entre 1 e 99'),
    shooting: z
      .number({ error: 'shooting é obrigatório' })
      .int('shooting deve ser um número inteiro')
      .min(1, 'Atributo deve ser entre 1 e 99')
      .max(99, 'Atributo deve ser entre 1 e 99'),
    passing: z
      .number({ error: 'passing é obrigatório' })
      .int('passing deve ser um número inteiro')
      .min(1, 'Atributo deve ser entre 1 e 99')
      .max(99, 'Atributo deve ser entre 1 e 99'),
    dribbling: z
      .number({ error: 'dribbling é obrigatório' })
      .int('dribbling deve ser um número inteiro')
      .min(1, 'Atributo deve ser entre 1 e 99')
      .max(99, 'Atributo deve ser entre 1 e 99'),
    defending: z
      .number({ error: 'defending é obrigatório' })
      .int('defending deve ser um número inteiro')
      .min(1, 'Atributo deve ser entre 1 e 99')
      .max(99, 'Atributo deve ser entre 1 e 99'),
    physical: z
      .number({ error: 'physical é obrigatório' })
      .int('physical deve ser um número inteiro')
      .min(1, 'Atributo deve ser entre 1 e 99')
      .max(99, 'Atributo deve ser entre 1 e 99'),
    potential: z
      .number({ error: 'potential é obrigatório' })
      .int('potential deve ser um número inteiro')
      .min(1, 'potential deve ser entre 1 e 99')
      .max(99, 'potential deve ser entre 1 e 99'),
  })
  .superRefine((data, ctx) => {
    veteranAgilityRule(data, ctx);

    const sum =
      data.pace +
      data.shooting +
      data.passing +
      data.dribbling +
      data.defending +
      data.physical;
    if (sum > 480) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A soma dos seis atributos não pode passar de 480',
        path: ['pace'],
      });
    }

    const maxAttr = Math.max(
      data.pace,
      data.shooting,
      data.passing,
      data.dribbling,
      data.defending,
      data.physical,
    );

    if (data.potential < maxAttr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Potencial não pode ser menor que o maior atributo técnico',
        path: ['potential'],
      });
    }

    if (data.age >= 33 && data.potential !== maxAttr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'No cadastro com 33 anos ou mais, o potencial deve ser igual ao maior dos seis atributos',
        path: ['potential'],
      });
    }
  });

export type CreatePlayerDto = z.infer<typeof createPlayerSchema>;
