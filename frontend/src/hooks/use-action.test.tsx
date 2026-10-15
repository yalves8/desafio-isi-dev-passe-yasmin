import { act, renderHook } from '@testing-library/react'
import { AxiosError, AxiosHeaders } from 'axios'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { LeagueDataContext } from '@/contexts/league-data-context'
import { useAction } from './use-action'

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

function apiError(status: number) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError(
    'erro',
    String(status),
    config,
    {},
    {
      status,
      statusText: '',
      data: { message: 'Recusado pela API' },
      headers: {},
      config,
    },
  )
}

function withLeagueData(refresh: () => void) {
  return ({ children }: { children: ReactNode }) => (
    <LeagueDataContext.Provider value={{ version: 0, refresh }}>
      {children}
    </LeagueDataContext.Provider>
  )
}

describe('useAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve devolver o resultado da ação e liberar o envio ao terminar', async () => {
    const { result } = renderHook(() => useAction(async (n: number) => n * 2, { errorTitle: 'x' }))

    let outcome
    await act(async () => {
      outcome = await result.current.run(21)
    })

    expect(outcome).toEqual({ ok: true, data: 42 })
    expect(result.current.isPending).toBe(false)
  })

  it('deve mostrar o erro num toast e devolver ok: false', async () => {
    const { result } = renderHook(() =>
      useAction(() => Promise.reject(new Error('boom')), { errorTitle: 'Não foi possível salvar' }),
    )

    let outcome
    await act(async () => {
      outcome = await result.current.run()
    })

    expect(outcome).toEqual({
      ok: false,
      error: 'Erro inesperado. Tente novamente.',
      status: undefined,
    })
    expect(toast.error).toHaveBeenCalledWith('Não foi possível salvar', {
      description: 'Erro inesperado. Tente novamente.',
    })
  })

  it('deve devolver o erro sem toast quando a tela mostra a mensagem', async () => {
    const { result } = renderHook(() =>
      useAction(() => Promise.reject(new Error('x')), { errorTitle: 'x', toastOnError: false }),
    )

    let outcome
    await act(async () => {
      outcome = await result.current.run()
    })

    expect(outcome).toMatchObject({ ok: false, error: 'Erro inesperado. Tente novamente.' })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('não deve enviar a mesma ação duas vezes enquanto a primeira não termina', async () => {
    let resolve!: () => void
    const action = vi.fn(() => new Promise<void>((r) => (resolve = r)))
    const { result } = renderHook(() => useAction(action, { errorTitle: 'x' }))

    await act(async () => {
      const first = result.current.run()
      const second = await result.current.run()
      expect(second).toEqual({ ok: false })
      resolve()
      await first
    })

    expect(action).toHaveBeenCalledTimes(1)
  })

  it.each([404, 409])(
    'deve recarregar os dados da liga numa recusa %i (o dado mudou depois de a tela abrir)',
    async (status) => {
      const refresh = vi.fn()
      const { result } = renderHook(
        () => useAction(() => Promise.reject(apiError(status)), { errorTitle: 'x' }),
        { wrapper: withLeagueData(refresh) },
      )

      await act(async () => {
        await result.current.run()
      })

      expect(refresh).toHaveBeenCalledTimes(1)
    },
  )

  it('não deve recarregar numa recusa de validação (400)', async () => {
    const refresh = vi.fn()
    const { result } = renderHook(
      () => useAction(() => Promise.reject(apiError(400)), { errorTitle: 'x' }),
      { wrapper: withLeagueData(refresh) },
    )

    await act(async () => {
      await result.current.run()
    })

    expect(refresh).not.toHaveBeenCalled()
  })
})
