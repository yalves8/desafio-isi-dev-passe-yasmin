import { Coins, HeartPulse, Search, Shield, Shirt, UserRound } from 'lucide-react'
import { DisabledHint } from '@/components/feedback/disabled-hint/disabled-hint'
import { InputWithIcon } from '@/components/form/input-with-icon/input-with-icon'
import { OptionFilter } from '../option-filter/option-filter'
import { RangeFilter } from '../range-filter/range-filter'
import type { PlayerFiltersProps } from './player-filters.types'

/** Barra de busca e filtros da lista de jogadores (todos combináveis) */
export function PlayerFilters({
  search,
  position,
  condition,
  club,
  age,
  value,
}: PlayerFiltersProps) {
  const { disabledReason: clubDisabledReason, ...clubFilter } = club
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border bg-card p-2 shadow-2xs xl:flex-nowrap">
      <InputWithIcon
        icon={Search}
        type="search"
        aria-label="Buscar por nome"
        placeholder="Buscar por nome"
        containerClassName="w-full min-w-44 sm:w-auto sm:flex-1"
        value={search.value}
        onChange={(e) => search.onChange(e.target.value)}
      />
      <OptionFilter icon={Shirt} label="Posição" allLabel="Todas as posições" {...position} />
      <OptionFilter
        icon={HeartPulse}
        label="Condição"
        allLabel="Todas as condições"
        {...condition}
      />
      <DisabledHint reason={clubDisabledReason}>
        <OptionFilter
          icon={Shield}
          label="Clube"
          allLabel="Todos os clubes"
          disabled={!!clubDisabledReason}
          {...clubFilter}
        />
      </DisabledHint>
      <RangeFilter icon={UserRound} label="Idade" unit="anos" {...age} />
      <RangeFilter icon={Coins} label="Valor de mercado" unit="moedas" {...value} />
    </div>
  )
}
