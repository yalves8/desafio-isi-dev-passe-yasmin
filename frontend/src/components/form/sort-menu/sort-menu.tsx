import { ArrowUpDown, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SortMenuProps } from './sort-menu.types'

/** Botão "Ordenar: …" das listas, com as opções de ordenação em menu */
export function SortMenu<T extends string>({
  options,
  value,
  onChange,
  contentClassName = 'min-w-64',
}: SortMenuProps<T>) {
  const current = options.find((o) => o.value === value) ?? options[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="md" className="gap-2 px-3 font-normal">
          <ArrowUpDown className="size-4 text-muted-foreground" />
          Ordenar: {current.short}
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={contentClassName}>
        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as T)}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
