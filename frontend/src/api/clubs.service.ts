import { api } from './client'
import type { Club } from './types'

export const clubsService = {
  async list(sort?: 'name' | 'net_worth_asc' | 'net_worth_desc'): Promise<Club[]> {
    const params = sort ? { sort } : undefined
    const { data } = await api.get<Club[]>('/clubs', { params })
    return data
  },
  async get(id: number): Promise<Club> {
    const { data } = await api.get<Club>(`/clubs/${id}`)
    return data
  },
  async create(input: { name: string; acronym: string }): Promise<Club> {
    const { data } = await api.post<Club>('/clubs', input)
    return data
  },
}
