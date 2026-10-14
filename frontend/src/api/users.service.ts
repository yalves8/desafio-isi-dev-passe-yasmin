import { api } from './client'
import type { Role, User } from './types'

export interface UserInput {
  name: string
  email: string
  password: string
  role: Role
}

export const usersService = {
  async list() {
    const { data } = await api.get<User[]>('/users')
    return data
  },
  async create(input: UserInput) {
    const { data } = await api.post<User>('/users', input)
    return data
  },
  async deactivate(id: number) {
    await api.patch(`/users/${id}/deactivate`)
  },
}
