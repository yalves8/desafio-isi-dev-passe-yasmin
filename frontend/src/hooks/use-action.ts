import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage, getErrorStatus } from '@/api/client'
import { useLeagueData } from '@/hooks/use-league-data'

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error?: string; status?: number }

/** Recusas por causa do que está gravado: o dado mudou depois de a tela abrir */
const STALE_DATA_STATUSES = new Set([404, 409])

interface ActionOptions {
  /** Título do toast de erro; a descrição é o `message` devolvido pela API */
  errorTitle: string
  /** `false`: a tela mostra o erro (devolvido no resultado) em vez do toast */
  toastOnError?: boolean
}

/**
 * Executa uma ação que chama a API: marca `isPending` (o botão fica desabilitado),
 * ignora um segundo envio enquanto o primeiro não termina e mostra o erro da API num toast.
 * Numa recusa 404 ou 409, recarrega os dados da liga para a tela mostrar o que está gravado.
 */
export function useAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  { errorTitle, toastOnError = true }: ActionOptions,
) {
  const [isPending, setIsPending] = useState(false)
  const pending = useRef(false)
  const { refresh } = useLeagueData()

  const run = async (...args: TArgs): Promise<ActionResult<TResult>> => {
    if (pending.current) return { ok: false }
    pending.current = true
    setIsPending(true)
    try {
      return { ok: true, data: await action(...args) }
    } catch (error) {
      const message = getErrorMessage(error)
      const status = getErrorStatus(error)
      if (toastOnError) toast.error(errorTitle, { description: message })
      if (status !== undefined && STALE_DATA_STATUSES.has(status)) refresh()
      return { ok: false, error: message, status }
    } finally {
      pending.current = false
      setIsPending(false)
    }
  }

  return { run, isPending }
}
