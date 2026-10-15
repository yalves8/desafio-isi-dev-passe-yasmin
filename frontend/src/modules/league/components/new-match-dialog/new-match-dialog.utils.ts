import type { Club } from '@/api/types'

/** Valida a escolha antes de enviar: os dois clubes e diferentes entre si (a API recusa com 400) */
export function validateClubs(homeId?: number, awayId?: number) {
  const errors: { home?: string; away?: string } = {}
  if (homeId === undefined) errors.home = 'Escolha o mandante.'
  if (awayId === undefined) errors.away = 'Escolha o visitante.'
  else if (awayId === homeId) errors.away = 'O visitante precisa ser diferente do mandante.'
  return errors
}

/** Lado citado na recusa da API (ex.: "Escalação incompleta: o Gama SC..."), para marcar o campo */
export function refusedSide(
  message: string | undefined,
  home: Club | undefined,
  away: Club | undefined,
): 'home' | 'away' | undefined {
  if (!message) return undefined
  if (home && message.includes(home.name)) return 'home'
  if (away && message.includes(away.name)) return 'away'
  return undefined
}
