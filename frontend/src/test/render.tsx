import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'

interface Options {
  route?: string
  path?: string
}

/** Renderiza a página dentro de MemoryRouter configurado para testes. */
export function renderPage(ui: ReactElement, { route = '/', path = '*' }: Options = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui} />
        <Route path="/jogadores" element={<p>tela de jogadores</p>} />
        <Route path="/clubes" element={<p>tela de clubes</p>} />
      </Routes>
    </MemoryRouter>,
  )
}
