import type { Condition, CreatePlayerInput, PlayerSort, Position } from '@/api/types'

export const PAGE_SIZE = 10

export const AGE_LIMITS = { min: 16, max: 45 } as const
export const MARKET_VALUE_LIMITS = { min: 0, max: 550 } as const

/** Ordem oficial das posições (GOL, ZAG, LAT, MEI, ATA) */
export const POSITION_OPTIONS: { value: Position; label: string }[] = [
  { value: 'GOL', label: 'Goleiro' },
  { value: 'ZAG', label: 'Zagueiro' },
  { value: 'LAT', label: 'Lateral' },
  { value: 'MEI', label: 'Meio-campo' },
  { value: 'ATA', label: 'Atacante' },
]

export const POSITION_LABEL = Object.fromEntries(
  POSITION_OPTIONS.map((p) => [p.value, p.label]),
) as Record<Position, string>

export const CONDITION_OPTIONS: {
  value: Condition
  label: string
  description: string
  /** Variante da Tag usada no ConditionBadge */
  tone: 'success' | 'warning' | 'danger'
}[] = [
  {
    value: 'APTO',
    label: 'Apto',
    description: 'Sem desconto por condição.',
    tone: 'success',
  },
  {
    value: 'MAL_CONDICIONADO',
    label: 'Mal condicionado',
    description:
      'Desconto de 15%. Agilidade de 80 a 100 corta pela metade; de 1 a 30 soma 10 pontos.',
    tone: 'warning',
  },
  {
    value: 'DOENTE',
    label: 'Doente',
    description: 'Desconto de 30%, com o mesmo ajuste de agilidade.',
    tone: 'danger',
  },
]

export const CONDITION_BY_VALUE = Object.fromEntries(
  CONDITION_OPTIONS.map((c) => [c.value, c]),
) as Record<Condition, (typeof CONDITION_OPTIONS)[number]>

/** As 6 ordenações aceitas pela API; `short` aparece no botão ("Ordenar: nome") */
export const SORT_OPTIONS: { value: PlayerSort; label: string; short: string }[] = [
  { value: 'name', label: 'Nome', short: 'nome' },
  { value: 'value_desc', label: 'Maior valor de mercado', short: 'maior valor de mercado' },
  { value: 'value_asc', label: 'Menor valor de mercado', short: 'menor valor de mercado' },
  { value: 'age_desc', label: 'Maior idade', short: 'maior idade' },
  { value: 'age_asc', label: 'Menor idade', short: 'menor idade' },
  { value: 'position', label: 'Posição (GOL a ATA)', short: 'posição' },
]

export type AttributeKey = keyof Pick<
  CreatePlayerInput,
  'pace' | 'shooting' | 'passing' | 'dribbling' | 'defending' | 'physical'
>

export const ATTRIBUTE_FIELDS: { key: AttributeKey; label: string }[] = [
  { key: 'pace', label: 'Velocidade' },
  { key: 'shooting', label: 'Finalização' },
  { key: 'passing', label: 'Passe' },
  { key: 'dribbling', label: 'Drible' },
  { key: 'defending', label: 'Defesa' },
  { key: 'physical', label: 'Físico' },
]

export const MAX_ATTRIBUTES_TOTAL = 480
