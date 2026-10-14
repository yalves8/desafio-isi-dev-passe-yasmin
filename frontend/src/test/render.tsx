import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LeagueDataProvider } from '@/contexts/league-data-provider'

interface Options {
  route?: string
  path?: string
}

const STUB_ROUTES = [
  { path: '/jogadores', text: 'tela de jogadores' },
  { path: '/clubes', text: 'tela de clubes' },
]

/** Renderiza a página dentro de MemoryRouter configurado para testes. */
export function renderPage(ui: ReactElement, { route = '/', path = '*' }: Options = {}) {
  return render(
    <LeagueDataProvider>
      <TooltipProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
            {STUB_ROUTES.filter((stub) => stub.path !== path).map((stub) => (
              <Route key={stub.path} path={stub.path} element={<p>{stub.text}</p>} />
            ))}
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    </LeagueDataProvider>,
  )
}
