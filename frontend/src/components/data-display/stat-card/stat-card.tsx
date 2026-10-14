import type { StatCardProps } from './stat-card.types'

/** Indicador em destaque: rótulo + ícone, valor grande e origem do valor */
export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border p-4">
      <p className="flex items-center justify-between text-xs text-muted-foreground">
        {label}
        <Icon className="size-4" aria-hidden />
      </p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}
