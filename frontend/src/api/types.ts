export type Role = 'ADMIN' | 'USER'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Room {
  id: number
  name: string
  capacity: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

/** Formato único de erro da API (HttpErrorFilter). */
export interface ApiError {
  statusCode: number
  message: string[]
}
