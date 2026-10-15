import { cn } from '@/lib/utils'
import { POSITION_OPTIONS } from '../../players.constants'
import type { PositionPickerProps } from './position-picker.types'

/** Cinco cartões de posição, na ordem oficial */
export function PositionPicker({ id, value, onChange, lockedTo, invalid }: PositionPickerProps) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-message`}
      className="grid grid-cols-5 gap-2"
    >
      {POSITION_OPTIONS.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${option.value} · ${option.label}`}
            disabled={lockedTo !== undefined && lockedTo !== option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-13 flex-col items-center justify-center rounded-lg border bg-card text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50',
              selected && 'border-primary bg-blue-50 text-primary hover:bg-blue-50',
              invalid && !value && 'border-destructive',
            )}
          >
            <span className="font-semibold">{option.value}</span>
            <span className={cn('text-xs text-muted-foreground', selected && 'text-primary')}>
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
