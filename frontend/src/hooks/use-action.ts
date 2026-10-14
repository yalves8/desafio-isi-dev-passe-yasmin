import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/api/client'

export type ActionResult<T> = { ok: true; data: T } | { ok: false }

interface ActionOptions {
  /** Título do toast de erro; a descrição é o `message` devolvido pela API */
  errorTitle: string
}

/**
 * Executa uma ação que chama a API: marca `isPending` (o botão fica desabilitado),
 * ignora um segundo envio enquanto o primeiro não termina e mostra o erro da API num toast.
 */
export function useAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  { errorTitle }: ActionOptions,
) {
  const [isPending, setIsPending] = useState(false)
  const pending = useRef(false)

  const run = async (...args: TArgs): Promise<ActionResult<TResult>> => {
    if (pending.current) return { ok: false }
    pending.current = true
    setIsPending(true)
    try {
      return { ok: true, data: await action(...args) }
    } catch (error) {
      toast.error(errorTitle, { description: getErrorMessage(error) })
      return { ok: false }
    } finally {
      pending.current = false
      setIsPending(false)
    }
  }

  return { run, isPending }
}
