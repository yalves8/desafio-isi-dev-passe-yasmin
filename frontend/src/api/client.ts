import axios, { isAxiosError } from 'axios'
import type { ApiError } from './types'

export const TOKEN_KEY = 'token'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // No login, o 401 é "senha errada": a tela mostra a mensagem em vez de redirecionar
    const isLogin = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiError>(error)) {
    if (!error.response) return 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    const msg = error.response.data?.message
    if (Array.isArray(msg)) return msg.join(', ')
    if (msg) return msg
  }
  return 'Erro inesperado. Tente novamente.'
}

export function getErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined
}
