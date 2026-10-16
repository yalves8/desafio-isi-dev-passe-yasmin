import type { LucideIcon } from 'lucide-react'

export interface FilterSelectOption {
  value: string
  label: string
}

export interface FilterSelectProps {
  icon: LucideIcon
  /** Nome acessível do filtro (ex.: "Filtrar por clube") */
  label: string
  /** Prefixo do valor mostrado: "Clube" vira "Clube: todos" ou "Clube: Águias FC" */
  prefix: string
  /** Opção que tira o filtro (ex.: "Todos os clubes") */
  allLabel: string
  options: FilterSelectOption[]
  /** Valor escolhido; `undefined` é sem filtro */
  value?: string
  onChange: (value: string | undefined) => void
  disabled?: boolean
  className?: string
}
