import type { ClubSort, Formation } from '@/api/types'
import type { ClubDetailsTab, LineupSector } from './clubs.types'

/** RN10: a liga aceita no máximo 20 clubes; cada um começa com 300,00 em caixa */
export const MAX_CLUBS = 20
export const INITIAL_CASH = 300
/** RN14: limite do elenco */
export const MAX_SQUAD = 12

/** `short` aparece no botão ("Ordenar: nome") */
export const CLUB_SORT_OPTIONS: { value: ClubSort; label: string; short: string }[] = [
  { value: 'name', label: 'Nome', short: 'nome' },
  {
    value: 'net_worth_desc',
    label: 'Patrimônio (maior para o menor)',
    short: 'patrimônio (maior para o menor)',
  },
  {
    value: 'net_worth_asc',
    label: 'Patrimônio (menor para o maior)',
    short: 'patrimônio (menor para o maior)',
  },
]

/** Aba aberta no endereço do clube (`?aba=escalacao`); o elenco é a aba padrão, sem parâmetro */
export const CLUB_TAB_PARAM = 'aba'
export const CLUB_TAB_SLUGS: Record<ClubDetailsTab, string> = {
  squad: 'elenco',
  lineup: 'escalacao',
  history: 'historico',
}

/** RN19: jogadores de linha por setor em cada formação (o goleiro fica fora da conta) */
export const FORMATIONS: Record<Formation, Record<Exclude<LineupSector, 'GK'>, number>> = {
  '3-1': { DEF: 3, MID: 0, ATT: 1 },
  '2-2': { DEF: 2, MID: 0, ATT: 2 },
  '2-1-1': { DEF: 2, MID: 1, ATT: 1 },
  '1-2-1': { DEF: 1, MID: 2, ATT: 1 },
}

export const FORMATION_OPTIONS: { value: Formation; label: string }[] = [
  { value: '3-1', label: 'Defesa 3, ataque 1' },
  { value: '2-2', label: 'Defesa 2, ataque 2' },
  { value: '2-1-1', label: 'Defesa 2, meio 1, ataque 1' },
  { value: '1-2-1', label: 'Defesa 1, meio 2, ataque 1' },
]

/** Formação sugerida quando o clube ainda não escalou */
export const DEFAULT_FORMATION: Formation = '2-1-1'

export const SECTORS: Record<LineupSector, { label: string; positions: string; short: string }> = {
  GK: { label: 'Goleiro', positions: 'GOL', short: 'Goleiro' },
  DEF: {
    label: 'Defesa',
    positions: 'ZAG ou LAT',
    short: 'Defesa',
  },
  MID: { label: 'Meio', positions: 'MEI', short: 'Meio' },
  ATT: { label: 'Ataque', positions: 'ATA', short: 'Ataque' },
}
