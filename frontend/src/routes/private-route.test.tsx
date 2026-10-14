import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context'
import { adminUser } from '@/test/render'
import { PrivateRoute, PublicOnlyRoute } from './private-route'

function renderAt(route: string, auth: Partial<AuthContextValue>) {
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
          <Route path="/" element={<p>início</p>} />
          <Route path="/login" element={<p>tela de login</p>} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/entrar" element={<p>formulário público</p>} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route path="/privada" element={<p>conteúdo privado</p>} />
          </Route>
          <Route element={<PrivateRoute roles={['ADMIN']} />}>
            <Route path="/admin" element={<p>área admin</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('PrivateRoute', () => {
  it('deve mostrar carregamento enquanto valida a sessão', () => {
    renderAt('/privada', { loading: true })
    expect(screen.getByRole('status')).toHaveTextContent('Verificando sessão')
  })

  it('deve redirecionar para /login sem sessão', () => {
    renderAt('/privada', {})
    expect(screen.getByText('tela de login')).toBeInTheDocument()
  })

  it('deve liberar a rota para usuário autenticado', () => {
    renderAt('/privada', { user: { ...adminUser, role: 'USER' } })
    expect(screen.getByText('conteúdo privado')).toBeInTheDocument()
  })

  it('deve redirecionar para o início quando faltar o perfil exigido', () => {
    renderAt('/admin', { user: { ...adminUser, role: 'USER' } })
    expect(screen.getByText('início')).toBeInTheDocument()
  })

  it('deve liberar a rota de admin para administrador', () => {
    renderAt('/admin', { user: adminUser, isAdmin: true })
    expect(screen.getByText('área admin')).toBeInTheDocument()
  })
})

describe('PublicOnlyRoute', () => {
  it('deve mandar quem já está logado para o início', () => {
    renderAt('/entrar', { user: adminUser })
    expect(screen.getByText('início')).toBeInTheDocument()
  })

  it('deve mostrar a tela pública para visitante', () => {
    renderAt('/entrar', {})
    expect(screen.getByText('formulário público')).toBeInTheDocument()
  })
})
