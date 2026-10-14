import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { authService } from '@/api/auth.service'
import { TOKEN_KEY } from '@/api/client'
import { useAuth } from '@/hooks/use-auth'
import { adminUser } from '@/test/render'
import { AuthProvider } from './auth-provider'

vi.mock('@/api/auth.service', () => ({ authService: { me: vi.fn(), login: vi.fn() } }))

function Probe() {
  const { user, loading, isAdmin, login, logout } = useAuth()
  return (
    <div>
      <p>{loading ? 'carregando' : (user?.name ?? 'anônimo')}</p>
      <p>{isAdmin ? 'admin' : 'comum'}</p>
      <button onClick={() => void login('admin@teste.com', 'Admin@123')}>entrar</button>
      <button onClick={logout}>sair</button>
    </div>
  )
}

const renderProvider = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )

describe('AuthProvider', () => {
  it('deve começar anônimo sem token salvo, sem chamar a API', () => {
    renderProvider()
    expect(screen.getByText('anônimo')).toBeInTheDocument()
    expect(authService.me).not.toHaveBeenCalled()
  })

  it('deve restaurar a sessão a partir do token salvo', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-valido')
    vi.mocked(authService.me).mockResolvedValue(adminUser)

    renderProvider()

    expect(screen.getByText('carregando')).toBeInTheDocument()
    expect(await screen.findByText('Administrador')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('deve descartar token inválido', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-expirado')
    vi.mocked(authService.me).mockRejectedValue(new Error('401'))

    renderProvider()

    expect(await screen.findByText('anônimo')).toBeInTheDocument()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('deve salvar o token no login e apagar no logout', async () => {
    vi.mocked(authService.login).mockResolvedValue({ accessToken: 'novo-token', user: adminUser })
    renderProvider()

    await userEvent.click(screen.getByRole('button', { name: 'entrar' }))
    await waitFor(() => expect(localStorage.getItem(TOKEN_KEY)).toBe('novo-token'))
    expect(screen.getByText('Administrador')).toBeInTheDocument()

    await act(() => userEvent.click(screen.getByRole('button', { name: 'sair' })))
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(screen.getByText('anônimo')).toBeInTheDocument()
  })
})
