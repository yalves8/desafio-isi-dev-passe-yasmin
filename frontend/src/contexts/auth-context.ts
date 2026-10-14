import { createContext } from 'react'
import type { User } from '@/api/types'

export interface AuthContextValue {
  user: User | null
  /** true enquanto valida o token salvo ao abrir o app */
  loading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
