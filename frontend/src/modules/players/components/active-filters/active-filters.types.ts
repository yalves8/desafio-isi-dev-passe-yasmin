import type { FilterChip, FilterKey } from '../../players.types'

export interface ActiveFiltersProps {
  chips: FilterChip[]
  /** Só a busca ativa: o rótulo vira "Resultados para a busca:" */
  searchOnly: boolean
  onRemove: (key: FilterKey) => void
  onClear: () => void
}
