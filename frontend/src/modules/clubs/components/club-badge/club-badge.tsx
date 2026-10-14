import { cn } from '@/lib/utils'
import type { ClubBadgeProps } from './club-badge.types'

/** Escudo simplificado do clube: a sigla num quadrado */
export function ClubBadge({ acronym, size = 'sm' }: ClubBadgeProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center border bg-muted font-medium',
        size === 'sm' ? 'size-9 rounded-lg text-xs' : 'size-12 rounded-xl text-sm font-semibold',
      )}
    >
      {acronym}
    </span>
  )
}
