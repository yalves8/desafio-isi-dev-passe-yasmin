import type { StatCardProps } from './stat-card.types'

/** Indicador em destaque: rótulo + ícone, valor grande e origem do valor */
export function StatCard({ label, value, hint, unit, icon: Icon }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-[14px] border bg-card p-5 shadow-2xs">
      <p className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        {label}
        <Icon className="size-4" aria-hidden />
      </p>
      <p className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}
