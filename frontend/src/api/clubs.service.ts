import { isAxiosError } from 'axios'
import { api } from './client'
import type {
  Club,
  ClubSort,
  Formation,
  ClubDuelAttributes,
  Lineup,
  TransactionFilters,
  TransactionsResponse,
} from './types'

/** Query da API: `type` com os tipos separados por vírgula (RN17); filtro ausente não vai */
function transactionParams({ types, player_id }: TransactionFilters) {
  return {
    ...(types?.length ? { type: types.join(',') } : {}),
    ...(player_id === undefined ? {} : { player_id }),
  }
}

export const clubsService = {
  async list(sort?: ClubSort): Promise<Club[]> {
    const params = sort ? { sort } : undefined
    const { data } = await api.get<Club[]>('/clubs', { params })
    return data
  },
  /** Clube com o elenco na ordem da RN11 e o contrato de cada jogador */
  async get(id: number): Promise<Club> {
    const { data } = await api.get<Club>(`/clubs/${id}`)
    return data
  },
  async create(input: { name: string; acronym: string }): Promise<Club> {
    const { data } = await api.post<Club>('/clubs', input)
    return data
  },
  /** Papel de cada vaga e atributos de duelo do elenco, para "Atributos usados" (RN20) */
  async getDuelAttributes(id: number): Promise<ClubDuelAttributes> {
    const { data } = await api.get<ClubDuelAttributes>(`/clubs/${id}/duel-attributes`)
    return data
  },

  async getLineup(id: number): Promise<Lineup> {
    const { data } = await api.get<Lineup>(`/clubs/${id}/lineup`)
    return data
  },
  /** Substitui a escalação inteira: formação + 5 titulares (RN19) */
  async updateLineup(
    id: number,
    input: { formation: Formation; player_ids: number[] },
  ): Promise<Lineup> {
    const { data } = await api.put<Lineup>(`/clubs/${id}/lineup`, input)
    return data
  },
  async getTransactions(
    id: number,
    filters: TransactionFilters = {},
  ): Promise<TransactionsResponse> {
    const { data } = await api.get<TransactionsResponse>(`/clubs/${id}/transactions`, {
      params: transactionParams(filters),
    })
    return data
  },
  /** CSV do histórico com os mesmos filtros (RN18) */
  async exportTransactions(id: number, filters: TransactionFilters = {}): Promise<Blob> {
    try {
      const { data } = await api.get<Blob>(`/clubs/${id}/transactions/export`, {
        params: transactionParams(filters),
        responseType: 'blob',
      })
      return data
    } catch (error) {
      // Com responseType blob, o erro JSON da API também chega como Blob: decodifica o `message`
      if (isAxiosError(error) && error.response?.data instanceof Blob) {
        try {
          error.response.data = JSON.parse(await error.response.data.text())
        } catch {
          // corpo não era JSON: segue com a mensagem genérica
        }
      }
      throw error
    }
  },
}
