import { z } from 'zod'
import type { Position } from '@/api/types'
import { AGE_LIMITS, ATTRIBUTE_FIELDS, MAX_ATTRIBUTES_TOTAL } from './players.constants'

/**
 * Validações dos formulários de jogador, espelhando o schema da API (create/update-player.dto):
 * o formulário recusa antes de enviar o que a API recusaria, com a mensagem junto ao campo.
 * Os campos numéricos chegam como texto dos inputs e saem como número.
 */

const POSITIONS = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'] as const satisfies readonly Position[]

/** Mesma normalização da API: espaços repetidos viram um só */
export const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ')

const nameField = z
  .string()
  .transform(normalizeName)
  .pipe(
    z
      .string()
      .min(1, 'Informe o nome.')
      .refine((v) => v.length >= 3 && v.length <= 100, 'Use de 3 a 100 caracteres.')
      .refine((v) => !/\d/.test(v), 'Use só letras, sem números.')
      .refine(
        (v) => v.split(' ').filter((w) => /\p{L}/u.test(w)).length >= 2,
        'Informe nome e sobrenome.',
      ),
  )

function intField(min: number, max: number, required: string, range: string) {
  return z
    .string()
    .trim()
    .min(1, required)
    .regex(/^\d+$/, 'Use um número inteiro.')
    .transform(Number)
    .pipe(z.number().min(min, range).max(max, range))
}

const ageField = intField(
  AGE_LIMITS.min,
  AGE_LIMITS.max,
  'Informe a idade.',
  `Use uma idade de ${AGE_LIMITS.min} a ${AGE_LIMITS.max} anos.`,
)
const agilityField = intField(1, 100, 'Informe a agilidade.', 'Use um valor de 1 a 100.')
const attributeField = intField(1, 99, 'Informe o valor.', 'Use um valor de 1 a 99.')

const positionField = z.enum(POSITIONS, { error: 'Escolha a posição.' })

/** Com 35 anos ou mais a agilidade vai até 85 */
function checkAgilityForAge(data: { age: number; agility: number }, ctx: z.RefinementCtx) {
  if (data.age >= 35 && data.agility > 85) {
    ctx.addIssue({
      code: 'custom',
      path: ['agility'],
      message: 'Com 35 anos ou mais, a agilidade vai até 85.',
    })
  }
}

export const createPlayerSchema = z
  .object({
    name: nameField,
    position: positionField,
    age: ageField,
    agility: agilityField,
    pace: attributeField,
    shooting: attributeField,
    passing: attributeField,
    dribbling: attributeField,
    defending: attributeField,
    physical: attributeField,
    potential: intField(1, 99, 'Informe o potencial.', 'Use um valor de 1 a 99.'),
  })
  .superRefine((data, ctx) => {
    checkAgilityForAge(data, ctx)

    const attributes = ATTRIBUTE_FIELDS.map((f) => data[f.key])
    const total = attributes.reduce((sum, v) => sum + v, 0)
    if (total > MAX_ATTRIBUTES_TOTAL) {
      ctx.addIssue({
        code: 'custom',
        path: ['root', 'attributes'],
        message: `A soma dos seis atributos é ${total}; o máximo é ${MAX_ATTRIBUTES_TOTAL}.`,
      })
    }

    const highest = Math.max(...attributes)
    if (data.age >= 33 && data.potential !== highest) {
      ctx.addIssue({
        code: 'custom',
        path: ['potential'],
        message: `Com 33 anos ou mais, use o maior atributo (${highest}).`,
      })
    } else if (data.potential < highest) {
      ctx.addIssue({
        code: 'custom',
        path: ['potential'],
        message: `Use pelo menos ${highest}, o maior atributo.`,
      })
    }
  })

export type CreatePlayerFormInput = z.input<typeof createPlayerSchema>

/** Edição (RN08): nome, posição, agilidade e idade; a idade não pode diminuir */
export function buildEditPlayerSchema(currentAge: number) {
  return z
    .object({
      name: nameField,
      position: positionField,
      age: ageField.refine(
        (age) => age >= currentAge,
        `A idade não pode diminuir (atual: ${currentAge}).`,
      ),
      agility: agilityField,
    })
    .superRefine(checkAgilityForAge)
}

export type EditPlayerFormInput = z.input<ReturnType<typeof buildEditPlayerSchema>>
