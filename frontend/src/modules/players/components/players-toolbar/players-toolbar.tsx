import { ArrowUpDown, ChevronDown } from 'lucide-react'
import type { PlayerSort } from '@/api/types'
import { DisabledHint } from '@/components/feedback/disabled-hint/disabled-hint'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SORT_OPTIONS } from '../../players.constants'
import type { PlayersTab } from '../../players.types'
import type { PlayersToolbarProps } from './players-toolbar.types'

const TABS: { value: PlayersTab; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'free', label: 'Livres' },
  { value: 'clubs', label: 'Em clubes' },
]

/** Abas Todos/Livres/Em clubes com contagem e o menu de ordenação */
export function PlayersToolbar({ tabs, sort }: PlayersToolbarProps) {
  const current = SORT_OPTIONS.find((o) => o.value === sort.value) ?? SORT_OPTIONS[0]

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <Tabs value={tabs.value} onValueChange={(v) => tabs.onChange(v as PlayersTab)}>
        <TabsList className="h-9 bg-muted">
          {TABS.map((tab) => {
            const reason = tab.value === 'free' ? tabs.freeDisabledReason : undefined
            return (
              <DisabledHint key={tab.value} reason={reason} className="h-full">
                <TabsTrigger value={tab.value} disabled={!!reason} className="gap-1.5 px-2.5">
                  {tab.label}
                  <span className="text-muted-foreground tabular-nums">
                    {tabs.counts[tab.value] ?? '–'}
                  </span>
                </TabsTrigger>
              </DisabledHint>
            )
          })}
        </TabsList>
      </Tabs>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="md" className="gap-2 px-3 font-normal">
            <ArrowUpDown className="size-4 text-muted-foreground" />
            Ordenar: {current.short}
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-64">
          <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sort.value}
            onValueChange={(v) => sort.onChange(v as PlayerSort)}
          >
            {SORT_OPTIONS.map((o) => (
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
