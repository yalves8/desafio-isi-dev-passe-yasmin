import { Navigate, Outlet, useLocation } from 'react-router'
import type { Role } from '@/api/types'
import { Spinner } from '@/components/feedback/states'
import { useAuth } from '@/hooks/use-auth'

export function PrivateRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner label="Verificando sessão" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}

/** Login e cadastro: quem já está logado vai direto para o app. */
export function PublicOnlyRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner label="Verificando sessão" />
  return user ? <Navigate to="/" replace /> : <Outlet />
}
