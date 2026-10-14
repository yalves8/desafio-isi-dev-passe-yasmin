import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { HomePage } from '@/pages/home/home-page'
import { NotFoundPage } from '@/pages/not-found/not-found-page'
import { PlayersPage } from '@/modules/players'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/jogadores', element: <PlayersPage /> },
      {
        path: '/clubes',
        element: (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h1 className="font-heading text-2xl font-bold">Clubes da Liga</h1>
            <p className="mt-1 text-sm text-muted-foreground">Módulo em desenvolvimento.</p>
          </div>
        ),
      },
      {
        path: '/clubes/:id',
        element: (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h1 className="font-heading text-2xl font-bold">Clubes da Liga</h1>
            <p className="mt-1 text-sm text-muted-foreground">Módulo em desenvolvimento.</p>
          </div>
        ),
      },
      {
        path: '/partidas',
        element: (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h1 className="font-heading text-2xl font-bold">Partidas</h1>
            <p className="mt-1 text-sm text-muted-foreground">Módulo em desenvolvimento.</p>
          </div>
        ),
      },
      {
        path: '/classificacao',
        element: (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h1 className="font-heading text-2xl font-bold">Classificação</h1>
            <p className="mt-1 text-sm text-muted-foreground">Módulo em desenvolvimento.</p>
          </div>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
