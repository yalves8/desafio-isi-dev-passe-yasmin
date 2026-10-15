import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { HomePage } from '@/pages/home/home-page'
import { NotFoundPage } from '@/pages/not-found/not-found-page'
import { ClubDetailsPage, ClubsPage } from '@/modules/clubs'
import { MatchDetailsPage, MatchesPage, StandingsPage } from '@/modules/league'
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
      { path: '/clubes', element: <ClubsPage /> },
      { path: '/clubes/:id', element: <ClubDetailsPage /> },
      { path: '/partidas', element: <MatchesPage /> },
      { path: '/partidas/:id', element: <MatchDetailsPage /> },
      { path: '/classificacao', element: <StandingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
