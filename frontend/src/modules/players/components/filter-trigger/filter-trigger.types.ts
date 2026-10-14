import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

export interface FilterTriggerProps extends ComponentProps<'button'> {
  icon: LucideIcon
  label: string
  /** Filtro com valor: texto em destaque */
  active: boolean
}
