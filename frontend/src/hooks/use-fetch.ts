import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/api/client'

interface FetchResult<T> {
  key: string
  data?: T
  error?: string
}

/**
 * Busca dados quando `key` muda. O carregamento é derivado (resultado de outra chave = carregando),
 * então não há setState síncrono no efeito e respostas antigas são descartadas com `ignore`.
 */
export function useFetch<T>(key: string, fetcher: () => Promise<T>) {
  const [result, setResult] = useState<FetchResult<T>>()

  useEffect(() => {
    let ignore = false
    fetcher()
      .then((data) => !ignore && setResult({ key, data }))
      .catch((e) => !ignore && setResult({ key, error: getErrorMessage(e) }))
    return () => {
      ignore = true
    }
    // o fetcher muda a cada render; a chave é quem define quando buscar de novo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const loading = result?.key !== key
  return {
    data: loading ? undefined : result?.data,
    error: loading ? null : (result?.error ?? null),
    loading,
  }
}
