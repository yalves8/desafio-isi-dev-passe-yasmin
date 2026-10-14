import { AxiosError, AxiosHeaders } from 'axios'
import { getErrorMessage, getErrorStatus } from './client'

function apiError(status: number, message: string | string[]) {
  return new AxiosError('erro', String(status), undefined, undefined, {
    status,
    data: { statusCode: status, message },
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  })
}

describe('getErrorMessage', () => {
  it('deve juntar a lista de mensagens da API', () => {
    expect(getErrorMessage(apiError(400, ['nome inválido', 'capacidade inválida']))).toBe(
      'nome inválido, capacidade inválida',
    )
  })

  it('deve orientar quando o servidor não responder', () => {
    expect(getErrorMessage(new AxiosError('Network Error'))).toBe(
      'Não foi possível conectar ao servidor. Verifique sua conexão.',
    )
  })

  it('deve usar mensagem genérica para erros desconhecidos', () => {
    expect(getErrorMessage(new Error('x'))).toBe('Erro inesperado. Tente novamente.')
  })

  it('deve extrair o status HTTP', () => {
    expect(getErrorStatus(apiError(409, 'conflito'))).toBe(409)
    expect(getErrorStatus(new Error('x'))).toBeUndefined()
  })
})
