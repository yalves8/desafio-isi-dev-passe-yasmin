import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { authService } from '@/api/auth.service'
import { renderPage } from '@/test/render'
import { RegisterPage } from './register-page'

vi.mock('@/api/auth.service', () => ({ authService: { register: vi.fn() } }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

async function fillForm(confirm = 'Senha@123') {
  await userEvent.type(screen.getByLabelText('Nome'), 'Maria Silva')
  await userEvent.type(screen.getByLabelText('E-mail'), 'maria@teste.com')
  await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123')
  await userEvent.type(screen.getByLabelText('Confirme a senha'), confirm)
  await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
}

describe('RegisterPage', () => {
  it('deve avisar quando as senhas não conferem', async () => {
    renderPage(<RegisterPage />)
    await fillForm('Outra@123')

    expect(await screen.findByText('As senhas não conferem')).toBeInTheDocument()
    expect(authService.register).not.toHaveBeenCalled()
  })

  it('deve criar a conta sem enviar a confirmação e ir para o login', async () => {
    vi.mocked(authService.register).mockResolvedValue({} as never)
    renderPage(<RegisterPage />)
    await fillForm()

    expect(await screen.findByText('tela de login')).toBeInTheDocument()
    expect(authService.register).toHaveBeenCalledWith({
      name: 'Maria Silva',
      email: 'maria@teste.com',
      password: 'Senha@123',
    })
  })

  it('deve mostrar e-mail duplicado (409) no próprio campo', async () => {
    vi.mocked(authService.register).mockRejectedValue(
      new AxiosError('erro', '409', undefined, undefined, {
        status: 409,
        data: { statusCode: 409, message: ['E-mail já cadastrado'] },
        statusText: '',
        headers: {},
        config: { headers: new AxiosHeaders() },
      }),
    )
    renderPage(<RegisterPage />)
    await fillForm()

    expect(await screen.findByText('E-mail já cadastrado')).toBeInTheDocument()
  })
})
