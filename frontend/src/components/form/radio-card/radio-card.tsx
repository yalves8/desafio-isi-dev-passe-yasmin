import { RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import type { RadioCardProps } from './radio-card.types'

/** Opção de um RadioGroup em forma de cartão clicável, com o estado escolhido e o desabilitado */
export function RadioCard({
  id,
  value,
  checked,
  disabled = false,
  labelledBy,
  describedBy,
  className,
  children,
}: RadioCardProps) {
  const radio = (
    <RadioGroupItem
      id={id}
      value={value}
      disabled={disabled}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    />
  )
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-muted/50',
        checked && 'border-primary bg-blue-50 ring-1 ring-primary hover:bg-blue-50',
        disabled && 'cursor-not-allowed opacity-60 hover:bg-transparent',
        className,
      )}
    >
      {children(radio)}
    </label>
  )
}
