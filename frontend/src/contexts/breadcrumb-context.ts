import { createContext } from 'react'

export interface BreadcrumbContextValue {
  /** Último item da trilha, definido pela tela (ex.: nome do clube) */
  detail?: string
  setDetail: (detail: string | undefined) => void
}

export const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  setDetail: () => {},
})
