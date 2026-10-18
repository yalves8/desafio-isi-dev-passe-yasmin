import { useSearchParams } from 'react-router'
import type { SearchParamCodec } from '@/lib/search-params'

/**
 * Um parâmetro da URL como estado da tela, lido e escrito pelo codificador. Gravar mantém os
 * outros parâmetros; o valor que o codificador omite (padrão ou vazio) sai da URL.
 */
export function useSearchParam<T>(key: string, codec: SearchParamCodec<T>) {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = codec.parse(searchParams.get(key))

  const setValue = (next: T) =>
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      const raw = codec.format(next)
      if (raw === undefined) params.delete(key)
      else params.set(key, raw)
      return params
    })

  return [value, setValue] as const
}
