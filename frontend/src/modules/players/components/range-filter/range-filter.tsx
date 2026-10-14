import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { FilterTrigger } from '../filter-trigger/filter-trigger'
import { useRangeFilter } from './range-filter.hook'
import type { RangeFilterProps } from './range-filter.types'

/** Filtro de faixa (idade, valor de mercado) com mínimo e máximo opcionais */
export function RangeFilter({ icon, label, activeLabel, unit, ...options }: RangeFilterProps) {
  const range = useRangeFilter(options)
  const { bounds } = options

  return (
    <Popover open={range.open} onOpenChange={range.onOpenChange}>
      <PopoverTrigger asChild>
        <FilterTrigger icon={icon} active={!!activeLabel} label={activeLabel ?? label} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            range.apply()
          }}
        >
          <p className="text-sm font-medium">{label}</p>
          <div className="flex items-center gap-2">
            <Input
              aria-label={`${label} mínimo`}
              inputMode="decimal"
              placeholder={`${bounds.min}`}
              value={range.draft.from}
              onChange={(e) => range.setFrom(e.target.value)}
              aria-invalid={!!range.error}
            />
            <span className="text-sm text-muted-foreground">a</span>
            <Input
              aria-label={`${label} máximo`}
              inputMode="decimal"
              placeholder={`${bounds.max}`}
              value={range.draft.to}
              onChange={(e) => range.setTo(e.target.value)}
              aria-invalid={!!range.error}
            />
          </div>
          <p className={cn('text-xs text-muted-foreground', range.error && 'text-destructive')}>
            {range.error ?? `Deixe um lado vazio para não limitar. Em ${unit}.`}
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={range.clear}>
              Limpar
            </Button>
            <Button type="submit" disabled={!!range.error}>
              Aplicar
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
