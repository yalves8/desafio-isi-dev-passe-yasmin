import type { LucideIcon } from 'lucide-react'

export interface RangeFilterOptions {
  min?: number
  max?: number
  bounds: { min: number; max: number }
  /** 0 para inteiros (idade); 2 para moedas */
  decimals: number
  onApply: (min: number | undefined, max: number | undefined) => void
}

export interface RangeFilterProps extends RangeFilterOptions {
  icon: LucideIcon
  label: string
  /** Rótulo do botão com faixa ativa (ex.: "Idade: 18 a 30") */
  activeLabel?: string
  unit: string
}
