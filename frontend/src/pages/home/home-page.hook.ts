import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { leagueService } from '@/api/league.service'
import type { LeagueStats } from '@/api/types'

export function useHomePage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<LeagueStats>({
    totalPlayers: 0,
    freePlayers: 0,
    totalClubs: 0,
    totalMatches: 0,
    leader: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    leagueService
      .getStats()
      .then((data) => {
        if (mounted) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const startNavigation = useCallback(() => {
    void navigate('/jogadores')
  }, [navigate])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.repeat) {
        startNavigation()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [startNavigation])

  return {
    stats,
    loading,
    startNavigation,
  }
}
