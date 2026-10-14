import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useBrasiliaClock } from '@/hooks/use-brasilia-clock'
import { cn } from '@/lib/utils'
import { Brand } from './brand'

interface NavItem {
  to: string
  label: string
}

const NAV: NavItem[] = [
  { to: '/jogadores', label: 'Jogadores' },
  { to: '/clubes', label: 'Clubes' },
  { to: '/partidas', label: 'Partidas' },
  { to: '/classificacao', label: 'Classificação' },
]

export function AppLayout() {
  const clock = useBrasiliaClock()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link
            to="/"
            className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Passe, página inicial"
          >
            <Brand />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'bg-accent font-semibold text-accent-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span
              className="font-mono text-xs text-muted-foreground tabular-nums"
              title="Horário de Brasília (UTC−3)"
            >
              {clock}
            </span>

            <div className="sm:hidden">
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Abrir menu de navegação">
                    <Menu className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {NAV.map((item) => (
                    <DropdownMenuItem key={item.to} asChild onSelect={() => setOpen(false)}>
                      <Link to={item.to} className="w-full">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
        Liga Fictícia 2026 · Horário de Brasília (UTC−3)
      </footer>
    </div>
  )
}
