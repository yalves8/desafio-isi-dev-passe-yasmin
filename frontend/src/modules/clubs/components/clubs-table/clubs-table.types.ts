import type { Club } from '@/api/types'
import type { ClubsToolbarProps } from '../clubs-toolbar/clubs-toolbar.types'

export interface ClubsTableProps extends Omit<ClubsToolbarProps, 'total'> {
  clubs: Club[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onCreate: () => void
}
