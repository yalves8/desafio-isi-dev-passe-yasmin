import { cn } from '@/lib/utils'
import type { AttributeBarProps } from './attribute-bar.types'

const MAX = 99
const percent = (n: number) => `${(n / MAX) * 100}%`

/** Atributo técnico de 1 a 99: barra azul com o valor e faixa clara até o potencial */
export function AttributeBar({ label, value, potential, compact = false }: AttributeBarProps) {
  return (
    <li className={cn('flex items-center', compact ? 'gap-2 text-xs' : 'gap-3 text-sm')}>
      <span className={cn('text-muted-foreground', compact ? 'w-18' : 'w-24')}>{label}</span>
      <span className="relative h-1.5 flex-1 rounded-full bg-zinc-100" aria-hidden>
        {potential !== undefined && (
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-blue-200"
            style={{ width: percent(potential) }}
          />
        )}
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: percent(value) }}
        />
      </span>
      <span className="w-6 text-right font-medium tabular-nums">{value}</span>
    </li>
  )
}
