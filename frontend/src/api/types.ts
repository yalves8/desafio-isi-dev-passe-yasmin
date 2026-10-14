/** Formato único de erro da API do desafio */
export interface ApiError {
  message: string | string[]
}

export type Position = 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA'
export type Condition = 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE'

export interface ContractDetails {
  purchase_value: number
  loyalty_until: string
  remaining_days: number
  penalty_rate: number
}

export interface Player {
  id: number
  name: string
  position: Position
  agility: number
  age: number
  condition: Condition
  base_value: number
  market_value: number
  pace: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  physical: number
  potential: number
  overall: number
  club_id: number | null
  contract?: ContractDetails | null
}

export interface Club {
  id: number
  name: string
  acronym: string
  cash: number
  squad_value: number
  net_worth: number
  players?: Player[]
}

export interface PaginatedPlayers {
  data: Player[]
  meta: {
    page: number
    limit: number
    total_items: number
    total_pages: number
  }
}

export interface LeagueStats {
  totalPlayers: number
  freePlayers: number
  totalClubs: number
  totalMatches: number
  leader?: {
    name: string
    points: number
  } | null
}
