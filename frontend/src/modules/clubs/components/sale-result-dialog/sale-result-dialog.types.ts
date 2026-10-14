import type { SaleResult } from '@/api/types'

export interface SaleResultDialogProps {
  sale: SaleResult
  onClose: () => void
}
