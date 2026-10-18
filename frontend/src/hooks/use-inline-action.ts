import { useState } from 'react'
import { useAction, type ActionResult } from '@/hooks/use-action'

/** Erro mostrado na própria tela: recusa da API (com status) ou falha de rede (sem resposta) */
export interface InlineError {
  kind: 'network' | 'refused'
  message: string
}

interface InlineActionOptions {
  /** Título usado pelo `useAction`; a tela escolhe o título que mostra a partir do `kind` */
  errorTitle: string
  /** Mensagem própria para a falha de rede; sem ela, vale a mensagem genérica de conexão */
  networkMessage?: string
}

/**
 * `useAction` com o erro guardado para a tela mostrar (alerta no diálogo ou no card) em vez do
 * toast. Cada envio limpa o erro anterior; uma recusa vira `refused` e a falta de resposta
 * (sem status HTTP) vira `network`, que pode ser enviada de novo.
 */
export function useInlineAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  { errorTitle, networkMessage }: InlineActionOptions,
) {
  const [error, setError] = useState<InlineError>()
  const { run: runAction, isPending } = useAction(action, { errorTitle, toastOnError: false })

  const run = async (...args: TArgs): Promise<ActionResult<TResult>> => {
    setError(undefined)
    const result = await runAction(...args)
    // Sem `error`, o envio foi ignorado porque o anterior ainda não terminou
    if (!result.ok && result.error !== undefined) {
      setError(
        result.status === undefined
          ? { kind: 'network', message: networkMessage ?? result.error }
          : { kind: 'refused', message: result.error },
      )
    }
    return result
  }

  return { run, isPending, error, clearError: () => setError(undefined) }
}
