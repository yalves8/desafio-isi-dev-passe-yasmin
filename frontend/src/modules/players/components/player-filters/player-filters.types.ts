import type { OptionFilterProps } from '../option-filter/option-filter.types'
import type { RangeFilterProps } from '../range-filter/range-filter.types'

type OptionFilterState = Omit<OptionFilterProps, 'icon' | 'label' | 'allLabel' | 'disabled'>
type RangeFilterState = Omit<RangeFilterProps, 'icon' | 'label' | 'unit'>

export interface PlayerFiltersProps {
  search: { value: string; onChange: (value: string) => void }
  position: OptionFilterState
  condition: OptionFilterState
  /** `disabledReason`: na aba "Livres" o filtro por clube não se aplica */
  club: OptionFilterState & { disabledReason?: string }
  age: RangeFilterState
  value: RangeFilterState
}
