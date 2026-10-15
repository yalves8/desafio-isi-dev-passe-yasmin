import { useEffect, useState } from 'react'
import { getErrorMessage, getErrorStatus } from '@/api/client'

interface FetchResult<T> {
  key: string
  data?: T
  error?: string
  /** Status HTTP da falha; ausente quando a resposta não chegou */
  errorStatus?: number
}

interface FetchOptions {
  /** Mantém o último dado enquanto a nova chave carrega (evita piscar a tela ao recarregar) */
  keepPreviousData?: boolean
}

/**
 * Busca dados quando `key` muda. O carregamento é derivado (resultado de outra chave = carregando),
 * então não há setState síncrono no efeito e respostas antigas são descartadas com `ignore`.
 */
export function useFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  { keepPreviousData = false }: FetchOptions = {},
) {
  const [result, setResult] = useState<FetchResult<T>>()

  useEffect(() => {
    let ignore = false
    fetcher()
      .then((data) => !ignore && setResult({ key, data }))
      .catch(
        (e) =>
          !ignore && setResult({ key, error: getErrorMessage(e), errorStatus: getErrorStatus(e) }),
      )
    return () => {
      ignore = true
    }
    // o fetcher muda a cada render; a chave é quem define quando buscar de novo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const loading = result?.key !== key
  return {
    data: loading && !keepPreviousData ? undefined : result?.data,
    error: loading ? null : (result?.error ?? null),
    errorStatus: loading ? undefined : result?.errorStatus,
    loading,
  }
}
