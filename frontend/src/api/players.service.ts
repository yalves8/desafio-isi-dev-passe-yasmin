import { api } from './client'
import type { PaginatedPlayers, Player, Position } from './types'

export interface PlayerFilters {
  page?: number
  limit?: number
  search?: string
  sort?: string
  position?: Position
  condition?: string
  free?: boolean
  club_id?: number
  min_age?: number
  max_age?: number
  min_value?: number
  max_value?: number
}

export const playersService = {
  async list(filters: PlayerFilters = {}): Promise<PaginatedPlayers> {
    const { data } = await api.get<PaginatedPlayers>('/players', { params: filters })
    return data
  },
  async get(id: number): Promise<Player> {
    const { data } = await api.get<Player>(`/players/${id}`)
    return data
  },
  async create(input: {
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
  }): Promise<Player> {
    const { data } = await api.post<Player>('/players', input)
    return data
  },
  async update(
    id: number,
    input: {
      name: string
      position: Position
      agility: number
      age: number
    },
  ): Promise<Player> {
    const { data } = await api.put<Player>(`/players/${id}`, input)
    return data
  },
  async updateCondition(id: number, condition: string): Promise<Player> {
    const { data } = await api.patch<Player>(`/players/${id}/condition`, { condition })
    return data
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/players/${id}`)
  },
}
