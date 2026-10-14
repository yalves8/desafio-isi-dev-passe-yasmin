import { cn } from '@/lib/utils'
import type { InfoListProps } from './info-list.types'

/** Lista rótulo → valor em cartão com divisórias */
export function InfoList({ items, className }: InfoListProps) {
  return (
    <dl className={cn('divide-y overflow-hidden rounded-xl border', className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            'flex items-center justify-between gap-4 px-4 py-3 text-sm',
            item.highlight && 'bg-muted/50',
          )}
        >
          <div className="leading-tight">
            <dt className={item.highlight ? 'font-semibold' : 'text-muted-foreground'}>
              {item.label}
            </dt>
            {item.description && (
              <dd className="text-xs text-muted-foreground">{item.description}</dd>
            )}
          </div>
          <dd className={cn('font-medium tabular-nums', item.highlight && 'text-lg font-semibold')}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
