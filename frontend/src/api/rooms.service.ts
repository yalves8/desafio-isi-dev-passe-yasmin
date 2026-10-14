import { api } from './client'
import type { Room } from './types'

export interface RoomFilters {
  name?: string
  minCapacity?: string
  sort?: 'name' | 'capacity' | 'createdAt'
  order?: 'asc' | 'desc'
}

export interface RoomInput {
  name: string
  capacity: number
}

/** Esconde o Axios das telas: as páginas só conhecem este service. */
export const roomsService = {
  async list(filters: RoomFilters = {}) {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    const { data } = await api.get<Room[]>('/rooms', { params })
    return data
  },
  async get(id: number) {
    const { data } = await api.get<Room>(`/rooms/${id}`)
    return data
  },
  async create(input: RoomInput) {
    const { data } = await api.post<Room>('/rooms', input)
    return data
  },
  async update(id: number, input: Partial<RoomInput>) {
    const { data } = await api.patch<Room>(`/rooms/${id}`, input)
    return data
  },
  async deactivate(id: number) {
    await api.patch(`/rooms/${id}/deactivate`)
  },
}
