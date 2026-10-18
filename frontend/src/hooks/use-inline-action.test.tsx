import { act, renderHook } from '@testing-library/react'
import { AxiosError, AxiosHeaders } from 'axios'
import { toast } from 'sonner'
import { useInlineAction } from './use-inline-action'

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

function apiError(status?: number) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError(
    'erro',
    status === undefined ? 'ERR_NETWORK' : String(status),
    config,
    {},
    status === undefined
      ? undefined
      : { status, statusText: '', data: { message: 'Recusado pela API' }, headers: {}, config },
  )
}

describe('useInlineAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve devolver o resultado da ação sem erro', async () => {
    const { result } = renderHook(() =>
      useInlineAction(async (n: number) => n * 2, { errorTitle: 'x' }),
    )

    let outcome
    await act(async () => {
      outcome = await result.current.run(21)
    })

    expect(outcome).toEqual({ ok: true, data: 42 })
    expect(result.current.error).toBeUndefined()
    expect(result.current.isPending).toBe(false)
  })

  it('deve guardar a recusa da API como "refused", sem toast', async () => {
    const { result } = renderHook(() =>
      useInlineAction(() => Promise.reject(apiError(409)), { errorTitle: 'Recusada' }),
    )

    await act(async () => {
      await result.current.run()
    })

    expect(result.current.error).toEqual({ kind: 'refused', message: 'Recusado pela API' })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('deve guardar a falha de rede como "network", com a mensagem do servidor por padrão', async () => {
    const { result } = renderHook(() =>
      useInlineAction(() => Promise.reject(apiError()), { errorTitle: 'x' }),
    )

    await act(async () => {
      await result.current.run()
    })

    expect(result.current.error).toEqual({
      kind: 'network',
      message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
    })
  })

  it('deve usar a mensagem de rede própria da tela quando informada', async () => {
    const { result } = renderHook(() =>
      useInlineAction(() => Promise.reject(apiError()), {
        errorTitle: 'x',
        networkMessage: 'A venda não foi confirmada.',
      }),
    )

    await act(async () => {
      await result.current.run()
    })

    expect(result.current.error).toEqual({
      kind: 'network',
      message: 'A venda não foi confirmada.',
    })
  })

  it('deve limpar o erro ao tentar de novo e com clearError', async () => {
    const action = vi.fn().mockRejectedValueOnce(apiError(409)).mockResolvedValueOnce('ok')
    const { result } = renderHook(() => useInlineAction(action, { errorTitle: 'x' }))

    await act(async () => {
      await result.current.run()
    })
    expect(result.current.error?.kind).toBe('refused')

    await act(async () => {
      await result.current.run()
    })
    expect(result.current.error).toBeUndefined()

    action.mockRejectedValueOnce(apiError(404))
    await act(async () => {
      await result.current.run()
    })
    expect(result.current.error?.kind).toBe('refused')
    act(() => result.current.clearError())
    expect(result.current.error).toBeUndefined()
  })

  it('não deve marcar erro no segundo envio ignorado enquanto o primeiro não termina', async () => {
    let resolve!: (value: string) => void
    const action = vi.fn(() => new Promise<string>((r) => (resolve = r)))
    const { result } = renderHook(() => useInlineAction(action, { errorTitle: 'x' }))

    let first!: Promise<unknown>
    let second
    await act(async () => {
      first = result.current.run()
      second = await result.current.run()
    })
    expect(second).toEqual({ ok: false })
    expect(result.current.error).toBeUndefined()

    await act(async () => {
      resolve('ok')
      await first
    })
    expect(action).toHaveBeenCalledOnce()
  })
})
