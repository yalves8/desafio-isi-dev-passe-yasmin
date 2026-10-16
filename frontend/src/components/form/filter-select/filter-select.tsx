import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { FilterSelectProps } from './filter-select.types'

const ALL = '__all__'

/** Filtro de escolha única das listas: ícone, "Prefixo: valor" e a opção de tirar o filtro */
export function FilterSelect({
  icon: Icon,
  label,
  prefix,
  allLabel,
  options,
  value,
  onChange,
  disabled,
  className,
}: FilterSelectProps) {
  const selected = options.find((o) => o.value === value)

  return (
    <Select
      value={selected ? selected.value : ALL}
      onValueChange={(v) => onChange(v === ALL ? undefined : v)}
      disabled={disabled}
    >
      <SelectTrigger
        aria-label={label}
        className={cn(
          'h-9 w-auto gap-2 pl-3 text-left text-muted-foreground *:data-[slot=select-value]:flex-1',
          className,
        )}
      >
        <Icon aria-hidden />
        <SelectValue>
          {prefix}: {selected?.label ?? 'todos'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
