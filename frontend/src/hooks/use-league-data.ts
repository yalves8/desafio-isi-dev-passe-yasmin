import { useContext } from 'react'
import { LeagueDataContext } from '@/contexts/league-data-context'

export function useLeagueData() {
  return useContext(LeagueDataContext)
}
