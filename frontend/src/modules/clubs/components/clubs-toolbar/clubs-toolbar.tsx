import { ArrowUpDown, ChevronDown } from 'lucide-react'
import type { ClubSort } from '@/api/types'
import { Tag } from '@/components/data-display/tag/tag'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { plural } from '@/lib/format'
import { CLUB_SORT_OPTIONS, MAX_CLUBS } from '../../clubs.constants'
import type { ClubsToolbarProps } from './clubs-toolbar.types'

/** Total de clubes, uso do limite da liga e ordenação */
export function ClubsToolbar({ total, sort, onSortChange }: ClubsToolbarProps) {
  const current = CLUB_SORT_OPTIONS.find((o) => o.value === sort) ?? CLUB_SORT_OPTIONS[0]
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <p className="flex items-center gap-2 font-medium">
        {plural(total, 'clube')}
        <Tag variant="muted">
          {total} de {MAX_CLUBS}
        </Tag>
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="md" className="gap-2 px-3 font-normal">
            <ArrowUpDown className="size-4 text-muted-foreground" />
            Ordenar: {current.short}
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-72">
          <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={(v) => onSortChange(v as ClubSort)}>
            {CLUB_SORT_OPTIONS.map((o) => (
              <DropdownMenuRadioItem key={o.value} value={o.value}>
                {o.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
