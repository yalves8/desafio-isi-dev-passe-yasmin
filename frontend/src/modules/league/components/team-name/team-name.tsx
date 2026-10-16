import { cn } from '@/lib/utils'
import { winnerSide } from '../../league.utils'
import type { TeamNameProps } from './team-name.types'

/** Nome do mandante ou do visitante, em negrito quando venceu a partida */
export function TeamName({ match, side }: TeamNameProps) {
  return (
    <span className={cn(winnerSide(match) === side && 'font-semibold')}>
      {match[side].club_name}
    </span>
  )
}
