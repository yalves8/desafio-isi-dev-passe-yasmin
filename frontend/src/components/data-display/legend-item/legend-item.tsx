import { cn } from '@/lib/utils'
import type { LegendItemProps } from './legend-item.types'

/** Item de legenda: o marcador (cor ou ícone) e o que ele significa */
export function LegendItem({ color, marker, children }: LegendItemProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {marker ?? <span className={cn('size-2 shrink-0 rounded-sm', color)} aria-hidden />}
      {children}
    </span>
  )
}
