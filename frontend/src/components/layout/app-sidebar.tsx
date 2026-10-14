import { Clock, Plus, Swords, Trophy } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { useAppSidebar } from './app-sidebar.hook'
import { NAV_GROUPS } from './layout.constants'

const navItemClass =
  'flex h-8 items-center gap-2 rounded-md border border-transparent px-2 text-sm text-foreground transition-colors hover:bg-white'

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-2">
      <p className="flex h-8 items-center px-2 text-xs text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}

/** Navegação lateral do Passe (Figma: 256px, fundo zinc-50) */
export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { clubs, clubsLoaded, counts, summary } = useAppSidebar()

  return (
    <div className="flex h-full flex-col gap-4 py-2">
      <Link
        to="/"
        onClick={onNavigate}
        aria-label="Passe, página inicial"
        className="mx-2 flex items-center gap-2.5 rounded-md p-2"
      >
        <img src="/assets/logo-passe.svg" alt="" className="size-8 rounded-lg" />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Passe</span>
          <span className="text-xs text-muted-foreground">Gestão da liga</span>
        </span>
      </Link>

      <nav aria-label="Principal" className="flex flex-col gap-2">
        {NAV_GROUPS.map((group) => (
          <SidebarSection key={group.label} title={group.label}>
            {group.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(navItemClass, isActive && 'border-border bg-white font-medium shadow-xs')
                }
              >
                <Icon className="size-4 text-muted-foreground" aria-hidden />
                <span className="flex-1">{label}</span>
                {counts[to] !== undefined && (
                  <span className="text-xs text-muted-foreground tabular-nums">{counts[to]}</span>
                )}
              </NavLink>
            ))}
          </SidebarSection>
        ))}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2">
        <div className="flex h-8 items-center justify-between px-2">
          <p className="text-xs text-muted-foreground">Clubes</p>
          <Link
            to="/clubes?novo=1"
            onClick={onNavigate}
            aria-label="Novo clube"
            className="rounded-sm text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-4" />
          </Link>
        </div>
        {clubsLoaded && clubs.length === 0 && (
          <p className="px-2 text-xs text-muted-foreground">Nenhum clube ainda.</p>
        )}
        {clubs.map((club) => (
          <NavLink
            key={club.id}
            to={`/clubes/${club.id}`}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(navItemClass, isActive && 'border-border bg-white font-medium shadow-xs')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden
                  className={cn(
                    'flex size-5 items-center justify-center rounded-sm border bg-white text-[11px] font-medium',
                    isActive && 'border-primary bg-primary text-primary-foreground',
                  )}
                >
                  {club.name[0].normalize('NFD')[0]}
                </span>
                <span className="truncate">{club.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mx-2 flex flex-col gap-3 rounded-lg border bg-white p-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Trophy className="size-4" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-medium">Liga Fictícia 2026</p>
            <p className="truncate text-xs text-muted-foreground">{summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Swords className="size-4" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-medium">Última partida</p>
            <p className="truncate text-xs text-muted-foreground">Nenhuma partida ainda</p>
          </div>
        </div>
        <p
          className="flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground"
          title="Horário de Brasília (UTC−3)"
        >
          <Clock className="size-3.5" aria-hidden />
          Horário de Brasília (UTC−3)
        </p>
      </div>
    </div>
  )
}
