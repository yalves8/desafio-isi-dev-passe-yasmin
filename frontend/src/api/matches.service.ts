import { api } from './client'
import type { Match, Standing } from './types'

export const matchesService = {
  /** Da mais recente para a mais antiga; `clubId` filtra mandante ou visitante (RN21) */
  async list(clubId?: number): Promise<Match[]> {
    const params = clubId === undefined ? undefined : { club_id: clubId }
    const { data } = await api.get<Match[]>('/matches', { params })
    return data
  },
  /** Partida com os 6 duelos gravados */
  async get(id: number): Promise<Match> {
    const { data } = await api.get<Match>(`/matches/${id}`)
    return data
  },
  /** Joga na hora: o placar e os duelos vêm da API (RN20) */
  async play(input: { home_club_id: number; away_club_id: number }): Promise<Match> {
    const { data } = await api.post<Match>('/matches', input)
    return data
  },
  async standings(): Promise<Standing[]> {
    const { data } = await api.get<Standing[]>('/standings')
    return data
  },
}
