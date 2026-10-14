import type { Club } from '@/api/types'

export interface ClubCreateDialogProps {
  onClose: () => void
  onCreated: (club: Club) => void
}
