import { screen } from '@testing-library/react'
import { usersService } from '@/api/users.service'
import { adminUser, renderPage } from '@/test/render'
import { UsersPage } from './users-page'

vi.mock('@/api/users.service', () => ({ usersService: { list: vi.fn(), deactivate: vi.fn() } }))

const commonUser = {
  ...adminUser,
  id: 2,
  name: 'Usuário Comum',
  email: 'u@teste.com',
  role: 'USER' as const,
}

describe('UsersPage', () => {
  it('não deve oferecer inativar o próprio usuário', async () => {
    vi.mocked(usersService.list).mockResolvedValue([adminUser, commonUser])
    renderPage(<UsersPage />, { auth: { user: adminUser, isAdmin: true } })

    expect(await screen.findAllByText('Usuário Comum')).not.toHaveLength(0)
    expect(screen.getAllByRole('button', { name: 'Inativar Usuário Comum' })).not.toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'Inativar Administrador' })).not.toBeInTheDocument()
  })

  it('deve mostrar erro com opção de tentar novamente', async () => {
    vi.mocked(usersService.list).mockRejectedValue(new Error('falha'))
    renderPage(<UsersPage />, { auth: { user: adminUser, isAdmin: true } })

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro inesperado')
  })
})
