import axios, { isAxiosError } from 'axios'
import type { ApiError } from './types'

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const normalizedBaseUrl = rawBaseUrl.endsWith('/api/v1')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, '')}/api/v1`

export const api = axios.create({ baseURL: normalizedBaseUrl })

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
