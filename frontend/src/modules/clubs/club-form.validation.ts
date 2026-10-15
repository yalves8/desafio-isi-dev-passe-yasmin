import { z } from 'zod'
import { normalizeText } from '@/lib/format'

/**
 * Validações do "Novo clube", espelhando a API (create-club.dto, RN10):
 * o formulário recusa antes de enviar o que a API recusaria, com a mensagem junto ao campo.
 * Nome e sigla repetidos só a API sabe: a resposta 409 aparece no diálogo.
 */

const normalizeSpaces = (value: string) => value.trim().replace(/\s+/g, ' ')

/** A sigla aparece no nome nessa ordem, sem diferenciar maiúsculas, minúsculas e acentos */
export function isAcronymInName(acronym: string, name: string) {
  const letters = normalizeText(name).toUpperCase()
  let index = 0
  for (const char of letters) {
    if (char === acronym[index]) index++
    if (index === acronym.length) return true
  }
  return false
}

function firstLetterOf(name: string) {
  return normalizeText(name).toUpperCase().match(/\p{L}/u)?.[0]
}

export const createClubSchema = z
  .object({
    name: z
      .string()
      .transform(normalizeSpaces)
      .pipe(
        z
          .string()
          .min(1, 'Informe o nome.')
          .refine((v) => v.length >= 3 && v.length <= 60, 'Use de 3 a 60 caracteres.')
          .refine((v) => /^[\p{L}\s\-.]+$/u.test(v), 'Use só letras, espaços, hífen e ponto.')
          .refine((v) => {
            const words = v.split(' ').filter((w) => /\p{L}/u.test(w)).length
            return words >= 2 && words <= 5
          }, 'Use de 2 a 5 palavras.'),
      ),
    acronym: z
      .string()
      .min(1, 'Informe a sigla.')
      .regex(/^[A-Z]{3}$/, 'Use 3 letras de A a Z, maiúsculas e sem acento.')
      .refine((v) => !(v[0] === v[1] && v[1] === v[2]), 'As três letras não podem ser iguais.'),
  })
  .superRefine((data, ctx) => {
    const first = firstLetterOf(data.name)
    if (data.acronym[0] !== first) {
      ctx.addIssue({
        code: 'custom',
        path: ['acronym'],
        message: `A primeira letra precisa ser a primeira do nome (${first}).`,
      })
    } else if (!isAcronymInName(data.acronym, data.name)) {
      ctx.addIssue({
        code: 'custom',
        path: ['acronym'],
        message: 'As 3 letras precisam aparecer no nome, nessa ordem.',
      })
    }
  })

export type CreateClubFormInput = z.input<typeof createClubSchema>
export type CreateClubInput = z.output<typeof createClubSchema>
