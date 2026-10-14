import { Coins, Landmark, Shirt, Wallet } from 'lucide-react'
import { StatCard } from '@/components/data-display/stat-card/stat-card'
import { formatMoney } from '@/lib/format'
import { MAX_SQUAD } from '../../clubs.constants'
import type { ClubStatsProps } from './club-stats.types'

/** Caixa, valor do elenco e patrimônio (RN11), como a API devolve */
export function ClubStats({ club, squadSize }: ClubStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Caixa"
        value={formatMoney(club.cash)}
        unit="moedas"
        hint="Só muda por compras e vendas"
        icon={Wallet}
      />
      <StatCard
        label="Valor do elenco"
        value={formatMoney(club.squad_value)}
        unit="moedas"
        hint="Soma dos valores de mercado"
        icon={Coins}
      />
      <StatCard
        label="Patrimônio"
        value={formatMoney(club.net_worth)}
        unit="moedas"
        hint="Caixa + valor do elenco"
        icon={Landmark}
      />
      <StatCard
        label="Elenco"
        value={`${squadSize} de ${MAX_SQUAD}`}
        hint={`Limite de ${MAX_SQUAD} jogadores`}
        icon={Shirt}
      />
    </div>
  )
}
