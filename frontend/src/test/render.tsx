import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import type { User } from '@/api/types'
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context'

export const adminUser: User = {
  id: 1,
  name: 'Administrador',
  email: 'admin@teste.com',
  role: 'ADMIN',
  active: true,
  createdAt: '2026-10-01T12:00:00Z',
  updatedAt: '2026-10-01T12:00:00Z',
}

interface Options {
  route?: string
  path?: string
  auth?: Partial<AuthContextValue>
}

/** Renderiza a página dentro de Router + AuthContext falso. */
export function renderPage(ui: ReactElement, { route = '/', path = '*', auth = {} }: Options = {}) {
  const value: AuthContextValue = {
    user: null,
    loading: false,
    isAdmin: false,
    login: vi.fn(),
    logout: vi.fn(),
    ...auth,
  }
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
          <Route path="/login" element={<p>tela de login</p>} />
          <Route path="/salas" element={<p>tela de salas</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}
