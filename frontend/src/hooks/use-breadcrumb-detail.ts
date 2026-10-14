import { useContext, useEffect } from 'react'
import { BreadcrumbContext } from '@/contexts/breadcrumb-context'

/** A tela informa o último item da trilha (ex.: "Águias FC"); some ao sair da tela */
export function useBreadcrumbDetail(detail: string | undefined) {
  const { setDetail } = useContext(BreadcrumbContext)
  useEffect(() => {
    setDetail(detail)
    return () => setDetail(undefined)
  }, [detail, setDetail])
}

export function useBreadcrumbContext() {
  return useContext(BreadcrumbContext)
}
