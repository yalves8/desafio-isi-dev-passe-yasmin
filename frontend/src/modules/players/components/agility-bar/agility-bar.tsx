import { cn } from '@/lib/utils'
import type { AgilityBarProps } from './agility-bar.types'
import { getAgilityTone } from './agility-bar.utils'

export function AgilityBar({ value }: AgilityBarProps) {
  return (
    <span className="flex items-center gap-2">
      <span className="w-6 text-right tabular-nums">{value}</span>
      <span className="h-1 w-10 overflow-hidden rounded-full bg-zinc-200" aria-hidden>
        <span
          className={cn('block h-full rounded-full', getAgilityTone(value))}
          style={{ width: `${value}%` }}
        />
      </span>
    </span>
  )
}
