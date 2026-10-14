import { LogOut, Menu, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { useBrasiliaClock } from '@/hooks/use-brasilia-clock'
import { cn } from '@/lib/utils'
import { Brand } from './brand'

interface NavItem {
  to: string
  label: string
  adminOnly?: boolean
}

const NAV: NavItem[] = [
  { to: '/salas', label: 'Salas' },
  { to: '/usuarios', label: 'Usuários', adminOnly: true },
]

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const clock = useBrasiliaClock()
  const items = NAV.filter((item) => !item.adminOnly || isAdmin)

  const handleLogout = () => {
    logout()
    void navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link to="/" className="rounded-md">
            <Brand />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-1 sm:flex">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'bg-accent text-accent-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span
              className="hidden font-mono text-xs text-muted-foreground tabular-nums md:inline"
              title="Horário de Brasília"
            >
              {clock}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Menu do usuário">
                  <Menu className="sm:hidden" />
                  <UserRound className="hidden sm:block" />
                  <span className="hidden max-w-32 truncate sm:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-medium">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="sm:hidden" />
                {items.map((item) => (
                  <DropdownMenuItem key={item.to} asChild className="sm:hidden">
                    <Link to={item.to}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
