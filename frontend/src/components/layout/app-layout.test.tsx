import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { adminUser, renderPage } from '@/test/render'
import { AppLayout } from './app-layout'

describe('AppLayout', () => {
  it('deve mostrar o menu de usuários só para administrador', () => {
    const { unmount } = renderPage(<AppLayout />, { auth: { user: adminUser, isAdmin: true } })
    expect(screen.getByRole('link', { name: 'Usuários' })).toBeInTheDocument()
    unmount()

    renderPage(<AppLayout />, { auth: { user: { ...adminUser, role: 'USER' } } })
    expect(screen.getByRole('link', { name: 'Salas' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Usuários' })).not.toBeInTheDocument()
  })

  it('deve sair e voltar para o login', async () => {
    const logout = vi.fn()
    renderPage(<AppLayout />, { auth: { user: adminUser, isAdmin: true, logout } })

    await userEvent.click(screen.getByRole('button', { name: 'Menu do usuário' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Sair' }))

    expect(logout).toHaveBeenCalled()
    expect(await screen.findByText('tela de login')).toBeInTheDocument()
  })
})
