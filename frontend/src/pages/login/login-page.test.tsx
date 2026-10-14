import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { renderPage } from '@/test/render'
import { LoginPage } from './login-page'

function apiError(status: number, message: string) {
  return new AxiosError('erro', String(status), undefined, undefined, {
    status,
    data: { statusCode: status, message: [message] },
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  })
}

describe('LoginPage', () => {
  it('deve mostrar erros de validação sem chamar a API', async () => {
    const login = vi.fn()
    renderPage(<LoginPage />, { auth: { login } })

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument()
    expect(screen.getByText('Informe a senha')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('deve mostrar a mensagem da API quando a senha estiver errada (401)', async () => {
    const login = vi.fn().mockRejectedValue(apiError(401, 'E-mail ou senha inválidos'))
    renderPage(<LoginPage />, { auth: { login } })

    await userEvent.type(screen.getByLabelText('E-mail'), 'admin@teste.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'errada')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos')
    expect(login).toHaveBeenCalledWith('admin@teste.com', 'errada')
  })
})
