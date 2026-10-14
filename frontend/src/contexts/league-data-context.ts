import { createContext } from 'react'

export interface LeagueDataContextValue {
  /** Muda a cada `refresh()`; telas e sidebar usam na chave de busca para recarregar */
  version: number
  refresh: () => void
}

export const LeagueDataContext = createContext<LeagueDataContextValue>({
  version: 0,
  refresh: () => {},
})
