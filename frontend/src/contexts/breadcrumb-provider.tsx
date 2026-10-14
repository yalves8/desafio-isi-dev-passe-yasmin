import { useMemo, useState, type ReactNode } from 'react'
import { BreadcrumbContext } from './breadcrumb-context'

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [detail, setDetail] = useState<string>()
  const value = useMemo(() => ({ detail, setDetail }), [detail])
  return <BreadcrumbContext value={value}>{children}</BreadcrumbContext>
}
