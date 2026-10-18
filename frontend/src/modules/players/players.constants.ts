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

/** Setores do campo: goleiro, defesa, meio e ataque */
export type Sector = 'GK' | 'DEF' | 'MID' | 'ATT'

/** Setor de cada posição: ZAG e LAT jogam na defesa */
export const POSITION_SECTOR: Record<Position, Sector> = {
  GOL: 'GK',
  ZAG: 'DEF',
  LAT: 'DEF',
  MEI: 'MID',
  ATA: 'ATT',
}

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

const ALL_CONDITIONS = CONDITION_OPTIONS.map((c) => c.value)

/** O que cada condição física muda no jogo (as mesmas regras da API) */
export const CONDITION_RULES: Record<
  Condition,
  {
    /** Pode ser titular (RN19) */
    canStart: boolean
    /** Ao entrar nesta condição, sai da escalação (RN19) */
    leavesLineup: boolean
    /** Joga com 85% do atributo (RN20) */
    worn: boolean
    /** Condições para as quais pode passar; de DOENTE não se vai direto para APTO */
    canBecome: readonly Condition[]
  }
> = {
  APTO: { canStart: true, leavesLineup: false, worn: false, canBecome: ALL_CONDITIONS },
  MAL_CONDICIONADO: { canStart: true, leavesLineup: false, worn: true, canBecome: ALL_CONDITIONS },
  DOENTE: {
    canStart: false,
    leavesLineup: true,
    worn: false,
    canBecome: ['MAL_CONDICIONADO', 'DOENTE'],
  },
}

export function canChangeCondition(from: Condition, to: Condition) {
  return CONDITION_RULES[from].canBecome.includes(to)
}

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
