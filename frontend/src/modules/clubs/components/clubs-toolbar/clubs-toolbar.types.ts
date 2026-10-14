import type { ClubSort } from '@/api/types'

export interface ClubsToolbarProps {
  total: number
  sort: ClubSort
  onSortChange: (sort: ClubSort) => void
}
