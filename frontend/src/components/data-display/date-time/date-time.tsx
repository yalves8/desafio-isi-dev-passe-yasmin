import { formatDate, formatTime } from '@/lib/format'
import type { DateTimeProps } from './date-time.types'

/** Data com a hora acinzentada ao lado (ou embaixo), como nas tabelas */
export function DateTime({ iso, stacked = false }: DateTimeProps) {
  if (stacked) {
    return (
      <span className="flex flex-col leading-tight tabular-nums">
        <span>{formatDate(iso)}</span>
        <span className="text-xs text-muted-foreground">{formatTime(iso)}</span>
      </span>
    )
  }
  return (
    <span className="tabular-nums">
      {formatDate(iso)} <span className="ml-1 text-muted-foreground">{formatTime(iso)}</span>
    </span>
  )
}
