import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Tag } from '@/components/data-display/tag/tag'
import { formatDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { scoreLabel, winnerSide } from '../../league.utils'
import type { RecentMatchesProps } from './recent-matches.types'

/** Últimas partidas ao lado da classificação (Figma L05) */
export function RecentMatches({ matches }: RecentMatchesProps) {
  return (
    <section
      aria-labelledby="recent-matches-title"
      className="overflow-hidden rounded-xl border bg-card shadow-2xs"
    >
      <header className="border-b px-5 py-4">
        <h2 id="recent-matches-title" className="text-base font-semibold">
          Últimas partidas
        </h2>
        <p className="text-xs text-muted-foreground">Da mais recente para a mais antiga.</p>
      </header>
      <div className="flex flex-col gap-3 px-5 py-4">
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma partida ainda.</p>
        ) : (
          matches.map((match) => {
            const winner = winnerSide(match)
            return (
              <Link key={match.id} to={`/partidas/${match.id}`} className="group block">
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatDate(match.played_at)}, {formatTime(match.played_at)}
                </p>
                <p className="flex flex-wrap items-center gap-2 text-sm group-hover:underline">
                  <span className={cn(winner === 'home' && 'font-semibold')}>
                    {match.home.club_name}
                  </span>
                  <Tag variant="muted" className="font-semibold tabular-nums">
                    {scoreLabel(match)}
                  </Tag>
                  <span className={cn(winner === 'away' && 'font-semibold')}>
                    {match.away.club_name}
                  </span>
                </p>
              </Link>
            )
          })
        )}
        <Link
          to="/partidas"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Ver todas as partidas <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
