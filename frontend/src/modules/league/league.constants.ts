import type { DuelAttribute, MatchResult } from '@/api/types'

export const RESULT_LABEL: Record<MatchResult, string> = {
  MANDANTE: 'Vitória do mandante',
  VISITANTE: 'Vitória do visitante',
  EMPATE: 'Empate',
}

export const ATTRIBUTE_LABEL: Record<DuelAttribute, { long: string; short: string }> = {
  shooting: { long: 'Finalização', short: 'Fin' },
  passing: { long: 'Passe', short: 'Pas' },
  dribbling: { long: 'Drible', short: 'Dri' },
  defending: { long: 'Defesa', short: 'Def' },
}

/** Ordem de desempate da classificação (RN21) */
export const STANDINGS_CRITERIA = [
  'Mais pontos',
  'Maior saldo de gols',
  'Mais gols marcados',
  'Nome do clube, de A a Z',
]
