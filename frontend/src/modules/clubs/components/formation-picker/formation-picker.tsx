import type { Formation } from '@/api/types'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { FORMATION_OPTIONS } from '../../clubs.constants'
import type { FormationPickerProps } from './formation-picker.types'
import { formationDots } from './formation-picker.utils'

/** Mini campo do Figma (32x42): linhas, meio-campo, grande área e um ponto por jogador */
function FormationIcon({ formation }: { formation: Formation }) {
  return (
    <svg aria-hidden viewBox="0 0 32 42" className="h-[42px] w-8 shrink-0">
      <rect width="32" height="42" rx="6" className="fill-green-900" />
      <g fill="none" stroke="white" strokeOpacity={0.4}>
        <rect x="2.5" y="2.5" width="27" height="37" />
        <line x1="2.5" y1="13.5" x2="29.5" y2="13.5" />
        <circle cx="16" cy="14" r="4" />
        <rect x="9.5" y="34.5" width="14" height="6" />
      </g>
      {formationDots(formation).map(({ x, y }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="white" />
      ))}
    </svg>
  )
}

export function FormationPicker({ value, onChange }: FormationPickerProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as Formation)}
      aria-label="Formação"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {FORMATION_OPTIONS.map((option) => {
        const checked = value === option.value
        return (
          <label
            key={option.value}
            htmlFor={`formation-${option.value}`}
            className={cn(
              'flex cursor-pointer gap-2 rounded-[10px] border px-3 py-2.5 transition-colors hover:bg-muted/50',
              checked && 'border-primary bg-blue-50 ring-1 ring-primary hover:bg-blue-50',
            )}
          >
            <FormationIcon formation={option.value} />
            <span className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <RadioGroupItem id={`formation-${option.value}`} value={option.value} />
                <span className={cn('text-sm font-semibold', checked && 'text-blue-700')}>
                  {option.value}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">{option.label}</span>
            </span>
          </label>
        )
      })}
    </RadioGroup>
  )
}
