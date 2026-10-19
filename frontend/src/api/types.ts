/** Formato único de erro da API do desafio */
export interface ApiError {
  message: string | string[]
}

export type Position = 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA'
export type Condition = 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE'

/** Ordenações aceitas por `GET /players?sort=` */
export type PlayerSort = 'name' | 'value_desc' | 'value_asc' | 'age_desc' | 'age_asc' | 'position'

interface ContractDetails {
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

/** Papel de um titular nos duelos da partida (RN20) */
export type DuelRole = 'attack' | 'defense'

export interface DuelValue {
  attribute: DuelAttribute
  /** Atributo cadastrado */
  value: number
  /** Valor que entra no duelo, já com o efeito da condição */
  match_value: number
}

export interface CreatePlayerInput {
  name: string
  position: Position
  agility: number
  age: number
  pace: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  physical: number
  potential: number
}

/** RN08: a edição só altera nome, posição, agilidade e idade */
export type UpdatePlayerInput = Pick<CreatePlayerInput, 'name' | 'position' | 'agility' | 'age'>

export interface Club {
  id: number
  name: string
  acronym: string
  cash: number
  squad_value: number
  net_worth: number
  players?: Player[]
}

export type ClubSort = 'name' | 'net_worth_asc' | 'net_worth_desc'

/** Formações aceitas (RN19): jogadores de linha por setor, de trás para frente */
export type Formation = '3-1' | '2-2' | '2-1-1' | '1-2-1'

/** `GET/PUT /clubs/{id}/lineup` */
export interface Lineup {
  club_id: number
  formation: Formation | null
  complete: boolean
  players: Player[]
}

/** Atributo usado ao atacar e ao defender, por jogador do elenco (RN20) */
export type DuelValues = Record<DuelRole, DuelValue>

/** `GET /clubs/{id}/duel-attributes`: papel de cada vaga (goleiro e linha de trás para frente) */
export interface ClubDuelAttributes {
  club_id: number
  roles: DuelRole[][]
  players: ({ id: number } & DuelValues)[]
}

export type TransactionType = 'COMPRA' | 'VENDA'

/** Transação gravada no momento da compra/venda (RN17); nunca é recalculada */
export interface Transaction {
  id: number
  club_id: number
  player_id: number
  player_name: string
  type: TransactionType
  value: number
  fee: number
  penalty: number
  profit: number | null
  cash_change: number
  created_at: string
}

export interface TransactionsSummary {
  total_spent: number
  total_received: number
  total_fees: number
  total_penalties: number
  total_profit: number
}

/** `GET /clubs/{id}/transactions` */
export interface TransactionsResponse {
  data: Transaction[]
  summary: TransactionsSummary
}

/** Filtros do histórico; sem `types`, vêm compras e vendas */
export interface TransactionFilters {
  types?: TransactionType[]
  player_id?: number
}

/** Corpo de `POST /players/{id}/buy`: clube comprador e fim da fidelidade (RN01) */
export interface BuyPlayerInput {
  club_id: number
  /** `AAAA-MM-DDTHH:MM-03:00` */
  loyalty_until: string
}

/** `POST /players/{id}/buy` (RN12 e RN13): transação COMPRA, contrato criado e novo caixa */
export interface PurchaseResult extends Transaction {
  contract: {
    purchase_value: number
    loyalty_until: string
    status: 'ATIVO'
  }
  club_cash: number
}

/** `POST /players/{id}/sell` (RN15 e RN16) */
export interface SaleResult extends Transaction {
  purchase_value: number
  remaining_days: number
  penalty_rate: number
  contract_status: 'ENCERRADO' | 'RESCINDIDO'
  club_cash: number
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

export type MatchResult = 'MANDANTE' | 'VISITANTE' | 'EMPATE'
export type DuelAttribute = 'shooting' | 'passing' | 'dribbling' | 'defending'

/** Lado da partida: clube, formação do momento e gols */
interface MatchSide {
  club_id: number
  club_name: string
  formation: Formation
  goals: number
}

/** Jogador de um duelo, com os dados e o valor gravados na partida (RN20) */
export interface DuelPlayer {
  player_id: number
  player_name: string
  position: Position
  condition: Condition
  attribute: DuelAttribute
  value: number
}

export interface Duel {
  order: number
  attacking_club_id: number
  attacker: DuelPlayer
  defender: DuelPlayer
  goal: boolean
}

/** `POST /matches`, `GET /matches/{id}` (com `duels`) e itens de `GET /matches` (sem) */
export interface Match {
  id: number
  played_at: string
  home: MatchSide
  away: MatchSide
  result: MatchResult
  duels?: Duel[]
}

/** Linha de `GET /standings` (RN21) */
export interface Standing {
  position: number
  club_id: number
  club_name: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}
