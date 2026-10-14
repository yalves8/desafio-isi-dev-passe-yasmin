import { ClipboardList, History, Shirt } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ClubDetailsTab } from '../../clubs.types'
import type { ClubTabsProps } from './club-tabs.types'

const TABS = [
  { value: 'elenco', label: 'Elenco', icon: Shirt },
  { value: 'escalacao', label: 'Escalação', icon: ClipboardList },
  { value: 'historico', label: 'Histórico', icon: History },
] as const

export function ClubTabs({ value, counts, onChange }: ClubTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ClubDetailsTab)}>
      {/* Sublinhado dentro da aba (bottom-0): com overflow-x-auto, o padrão em -5px some cortado */}
      <TabsList
        variant="line"
        className="w-full justify-start gap-4 overflow-x-auto border-b p-0 group-data-horizontal/tabs:h-auto"
      >
        {TABS.map(({ value: tab, label, icon: Icon }) => {
          const count = tab === 'escalacao' ? undefined : counts[tab]
          return (
            <TabsTrigger
              key={tab}
              value={tab}
              className="group/tab h-11 flex-none gap-2 rounded-none px-0.5 py-0 text-muted-foreground group-data-horizontal/tabs:after:bottom-0 data-active:text-foreground group-data-[variant=line]/tabs-list:data-active:after:bg-primary"
            >
              <Icon className="size-4" />
              {label}
              {count !== undefined && (
                <span className="rounded-full bg-muted px-1.5 text-xs leading-[18px] font-medium text-muted-foreground tabular-nums group-data-active/tab:bg-blue-50 group-data-active/tab:text-blue-700">
                  {count}
                </span>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
