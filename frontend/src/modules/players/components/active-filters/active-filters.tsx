import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ActiveFiltersProps } from './active-filters.types'

/** Chips dos filtros ativos, cada um removível, e "Limpar filtros" */
export function ActiveFilters({ chips, searchOnly, onRemove, onClear }: ActiveFiltersProps) {
  if (chips.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">
        {searchOnly ? 'Resultados para a busca:' : 'Filtros ativos:'}
      </span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex h-7 items-center gap-1.5 rounded-md bg-muted pr-1 pl-2.5 text-xs font-medium"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            aria-label={`Remover ${chip.label}`}
            className="rounded-sm p-0.5 hover:bg-zinc-200"
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      <Button
        variant="link"
        className="h-7 px-1"
        onClick={onClear}
        data-testid="active-filters-clear"
      >
        Limpar filtros
      </Button>
    </div>
  )
}
