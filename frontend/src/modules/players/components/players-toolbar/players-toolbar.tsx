import { DisabledHint } from '@/components/feedback/disabled-hint/disabled-hint'
import { SortMenu } from '@/components/form/sort-menu/sort-menu'
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
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      {/* Manual: troca no clique ou Enter; no foco também, cada troca empilharia no histórico */}
      <Tabs
        value={tabs.value}
        activationMode="manual"
        onValueChange={(v) => tabs.onChange(v as PlayersTab)}
      >
        <TabsList className="h-9 bg-muted">
          {TABS.map((tab) => {
            const reason = tab.value === 'free' ? tabs.freeDisabledReason : undefined
            return (
              <DisabledHint key={tab.value} reason={reason} className="h-full">
                <TabsTrigger
                  value={tab.value}
                  disabled={!!reason}
                  data-testid={`players-tab-${tab.value}`}
                  className="gap-1.5 px-2.5"
                >
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

      <SortMenu options={SORT_OPTIONS} value={sort.value} onChange={sort.onChange} />
    </div>
  )
}
