import { ChevronRight, PanelLeft, RefreshCw } from 'lucide-react'
import { Link, Outlet } from 'react-router'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BreadcrumbProvider } from '@/contexts/breadcrumb-provider'
import { LeagueDataProvider } from '@/contexts/league-data-provider'
import { cn } from '@/lib/utils'
import { useAppLayout } from './app-layout.hook'
import { AppSidebar } from './app-sidebar'

function AppShell() {
  const { breadcrumb, breadcrumbDetail, refresh, sidebar } = useAppLayout()

  return (
    <div className="flex min-h-dvh bg-sidebar text-foreground">
      <aside
        className={cn('sticky top-0 hidden h-dvh w-64 shrink-0', sidebar.desktopOpen && 'lg:block')}
      >
        <AppSidebar />
      </aside>

      <Sheet open={sidebar.mobileOpen} onOpenChange={sidebar.setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <SheetDescription className="sr-only">Telas e clubes da liga</SheetDescription>
          <AppSidebar onNavigate={sidebar.closeMobile} />
        </SheetContent>
      </Sheet>

      <div className={cn('flex min-w-0 flex-1 p-2', sidebar.desktopOpen && 'lg:pl-0')}>
        <div className="flex min-w-0 flex-1 flex-col rounded-xl border bg-card shadow-2xs">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={sidebar.toggle}
              aria-label="Alternar menu lateral"
            >
              <PanelLeft />
            </Button>
            <span className="h-4 w-px bg-border" aria-hidden />
            {breadcrumb && (
              <nav aria-label="Trilha" className="flex min-w-0 items-center gap-2 text-sm">
                <span className="text-muted-foreground">{breadcrumb.group}</span>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                {breadcrumbDetail ? (
                  <>
                    <Link
                      to={breadcrumb.to}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {breadcrumb.page}
                    </Link>
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    <span aria-current="page" className="truncate">
                      {breadcrumbDetail}
                    </span>
                  </>
                ) : (
                  <span aria-current="page">{breadcrumb.page}</span>
                )}
              </nav>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className="ml-auto"
              onClick={refresh}
              aria-label="Atualizar dados"
            >
              <RefreshCw />
            </Button>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-8 sm:pt-7 sm:pb-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export function AppLayout() {
  return (
    <LeagueDataProvider>
      <BreadcrumbProvider>
        <TooltipProvider delayDuration={200}>
          <AppShell />
        </TooltipProvider>
      </BreadcrumbProvider>
    </LeagueDataProvider>
  )
}
