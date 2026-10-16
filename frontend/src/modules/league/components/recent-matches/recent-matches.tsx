import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Tag } from '@/components/data-display/tag/tag'
import { SectionCard } from '@/components/layout/section-card/section-card'
import { formatDateTime } from '@/lib/format'
import { scoreLabel } from '../../league.utils'
import { TeamName } from '../team-name/team-name'
import type { RecentMatchesProps } from './recent-matches.types'

/** Últimas partidas ao lado da classificação (Figma L05) */
export function RecentMatches({ matches }: RecentMatchesProps) {
  return (
    <SectionCard title="Últimas partidas" description="Da mais recente para a mais antiga.">
      <div className="flex flex-col gap-3 px-5 py-4">
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma partida ainda.</p>
        ) : (
          matches.map((match) => {
            return (
              <Link
                key={match.id}
                to={`/partidas/${match.id}`}
                data-testid={`recent-match-${match.id}`}
                className="group block"
              >
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatDateTime(match.played_at)}
                </p>
                <p className="flex flex-wrap items-center gap-2 text-sm group-hover:underline">
                  <TeamName match={match} side="home" />
                  <Tag variant="muted" className="font-semibold tabular-nums">
                    {scoreLabel(match)}
                  </Tag>
                  <TeamName match={match} side="away" />
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
    </SectionCard>
  )
}
