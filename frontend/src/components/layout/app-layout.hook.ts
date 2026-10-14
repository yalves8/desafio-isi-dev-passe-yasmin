import { useState } from 'react'
import { useLocation } from 'react-router'
import { useLeagueData } from '@/hooks/use-league-data'
import { getBreadcrumb } from './layout.constants'

const DESKTOP_QUERY = '(min-width: 1024px)'

export function useAppLayout() {
  const { pathname } = useLocation()
  const { refresh } = useLeagueData()
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  // No desktop o botão recolhe a sidebar; abaixo de lg ele abre a gaveta
  const toggleSidebar = () => {
    if (window.matchMedia?.(DESKTOP_QUERY).matches) setDesktopOpen((open) => !open)
    else setMobileOpen(true)
  }

  return {
    breadcrumb: getBreadcrumb(pathname),
    refresh,
    sidebar: {
      desktopOpen,
      mobileOpen,
      setMobileOpen,
      closeMobile: () => setMobileOpen(false),
      toggle: toggleSidebar,
    },
  }
}
