import { api } from './client'
import type { LoginResponse, User } from './types'

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
    return data
  },
  async register(input: { name: string; email: string; password: string }) {
    const { data } = await api.post<User>('/auth/register', input)
    return data
  },
  async me() {
    const { data } = await api.get<User>('/auth/me')
    return data
  },
}
