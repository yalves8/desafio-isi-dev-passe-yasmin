import type { Formation } from '@/api/types'

export interface FormationPickerProps {
  value: Formation
  onChange: (formation: Formation) => void
}
