import type { LucideIcon } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

export interface OptionFilterProps {
  icon: LucideIcon
  label: string
  /** Opção que limpa o filtro (ex.: "Todas as posições") */
  allLabel: string
  value?: string
  options: FilterOption[]
  disabled?: boolean
  onChange: (value: string | undefined) => void
}
