import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { LeagueDataContext } from './league-data-context'

/** Compartilha um contador de versão: qualquer ação que muda dados chama `refresh()`. */
export function LeagueDataProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  const value = useMemo(() => ({ version, refresh }), [version, refresh])

  return <LeagueDataContext value={value}>{children}</LeagueDataContext>
}
