import type { ClubDetailsTab } from '../../clubs.types'

export interface ClubTabsProps {
  value: ClubDetailsTab
  counts: { squad?: number; history?: number }
  onChange: (tab: ClubDetailsTab) => void
}
