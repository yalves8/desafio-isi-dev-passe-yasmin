/** Tipos compartilhados entre os componentes e as telas do módulo de jogadores */

export type PlayersTab = 'all' | 'free' | 'clubs'

export type FilterKey = 'search' | 'position' | 'condition' | 'clubId' | 'age' | 'value'

export interface FilterChip {
  key: FilterKey
  label: string
}
