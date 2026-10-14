import { POSITION_LABEL } from '../../players.constants'
import { PlayerAvatar } from '../player-avatar/player-avatar'
import type { PlayerSummaryProps } from './player-summary.types'

/** Cartão compacto do jogador usado no topo dos diálogos */
export function PlayerSummary({ player, aside }: PlayerSummaryProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3">
      <PlayerAvatar id={player.id} name={player.name} />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate font-medium">{player.name}</p>
        <p className="text-xs text-muted-foreground">
          {player.position} · {POSITION_LABEL[player.position]} · {player.age} anos
        </p>
      </div>
      {aside}
    </div>
  )
}
