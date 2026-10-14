import { cn } from '@/lib/utils'

/** Marca provisória: troque pelo nome do sistema do enunciado. */
export function Brand({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 font-heading text-lg font-bold', className)}
    >
      <span
        aria-hidden
        className={cn(
          'grid size-7 place-items-center rounded-md font-mono text-xs',
          inverted ? 'bg-signal text-signal-foreground' : 'bg-primary text-primary-foreground',
        )}
      >
        R
      </span>
      Reservas
    </span>
  )
}
