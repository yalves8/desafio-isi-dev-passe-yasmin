import { formatMoney } from '@/lib/format'
import { POSITION_LABEL } from '../../players.constants'
import { PlayerIdentity } from '../player-identity/player-identity'
import type { PlayerSummaryProps } from './player-summary.types'

/** Cartão compacto do jogador usado no topo dos diálogos */
export function PlayerSummary({ player, aside, showMarketValue = false }: PlayerSummaryProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3">
      <PlayerIdentity
        id={player.id}
        name={player.name}
        detail={`${player.position} · ${POSITION_LABEL[player.position]} · ${player.age} anos`}
        className="flex-1"
      />
      {showMarketValue && (
        <p className="text-right leading-tight">
          <span className="block text-xs text-muted-foreground">Valor de mercado</span>
          <span className="text-lg font-semibold tabular-nums">
            {formatMoney(player.market_value)}
          </span>
        </p>
      )}
      {aside}
    </div>
  )
}
