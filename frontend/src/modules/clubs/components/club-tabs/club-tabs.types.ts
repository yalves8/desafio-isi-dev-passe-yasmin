import type { ClubDetailsTab } from '../../clubs.types'

export interface ClubTabsProps {
  value: ClubDetailsTab
  counts: { elenco?: number; historico?: number }
  onChange: (tab: ClubDetailsTab) => void
}
