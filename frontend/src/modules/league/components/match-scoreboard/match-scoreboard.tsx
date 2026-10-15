import { Tag } from '@/components/data-display/tag/tag'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ClubBadge } from '@/modules/clubs'
import { RESULT_LABEL } from '../../league.constants'
import { scoreLabel } from '../../league.utils'
import type { MatchScoreboardProps } from './match-scoreboard.types'

/** Placar da partida (Figma L01 e L03): mandante, placar com data e resultado, visitante */
export function MatchScoreboard({
  match,
  clubsById,
  showFormation = false,
  action,
}: MatchScoreboardProps) {
  const side = (which: 'home' | 'away') => {
    const s = match[which]
    const role = which === 'home' ? 'Mandante' : 'Visitante'
    return {
      name: s.club_name,
      acronym: clubsById.get(s.club_id)?.acronym ?? s.club_name.slice(0, 3).toUpperCase(),
      subtitle: showFormation ? `${role} · ${s.formation}` : role,
    }
  }
  const home = side('home')
  const away = side('away')

  return (
    <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <p className="text-base font-semibold">{home.name}</p>
          <p className="text-xs text-muted-foreground">{home.subtitle}</p>
        </div>
        <ClubBadge acronym={home.acronym} size="lg" />
      </div>
      <div className="flex flex-col items-center gap-1.5 px-6">
        <span
          aria-label={`Placar ${scoreLabel(match)}`}
          className="rounded-lg bg-muted px-4 py-1.5 text-2xl font-semibold tabular-nums"
        >
          {scoreLabel(match)}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDateTime(match.played_at)}
        </span>
        <Tag>{RESULT_LABEL[match.result]}</Tag>
      </div>
      <div className="flex items-center gap-3">
        <ClubBadge acronym={away.acronym} size="lg" />
        <div className="leading-tight">
          <p className="text-base font-semibold">{away.name}</p>
          <p className="text-xs text-muted-foreground">{away.subtitle}</p>
        </div>
      </div>
      {action && <div className={cn('sm:absolute sm:right-0')}>{action}</div>}
    </div>
  )
}
