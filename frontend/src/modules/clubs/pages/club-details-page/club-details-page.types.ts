import type { Player, SaleResult } from '@/api/types'

export type ClubDetailsDialog =
  { type: 'sell'; player: Player } | { type: 'sold'; sale: SaleResult } | null
