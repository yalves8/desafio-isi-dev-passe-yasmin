import type { LucideIcon } from 'lucide-react'

export interface StatCardProps {
  label: string
  value: string
  hint: string
  /** Unidade ao lado do valor (ex.: "moedas") */
  unit?: string
  icon: LucideIcon
}
