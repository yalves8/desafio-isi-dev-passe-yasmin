import { ChevronRight, Plus, Swords } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MatchScoreboard } from '../../components/match-scoreboard/match-scoreboard'
import { MatchesTable } from '../../components/matches-table/matches-table'
import { NewMatchDialog } from '../../components/new-match-dialog/new-match-dialog'
import { useMatchesPage } from './matches-page.hook'

export function MatchesPage() {
  const { header, clubsById, latest, table, dialog } = useMatchesPage()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Swords}
        title="Partidas"
        description="Jogue partidas entre clubes com os 5 titulares escalados e acompanhe o histórico."
        actions={
          <Button size="md" onClick={header.onCreate}>
            <Plus /> Nova partida
          </Button>
        }
      />

      {(latest.loading || latest.match) && (
        <section aria-labelledby="latest-title" className="flex flex-col gap-3">
          <h2 id="latest-title" className="text-sm font-medium text-muted-foreground">
            Última partida
          </h2>
          <div className="rounded-xl border bg-card p-6 shadow-2xs">
            {latest.match ? (
              <MatchScoreboard
                match={latest.match}
                clubsById={clubsById}
                action={
                  <Button variant="outline" size="md" asChild>
                    <Link to={`/partidas/${latest.match.id}`}>
                      Ver duelos <ChevronRight />
                    </Link>
                  </Button>
                }
              />
            ) : (
              <Skeleton className="mx-auto h-20 w-96" />
            )}
          </div>
        </section>
      )}

      <MatchesTable {...table} />

      <p className="text-xs text-muted-foreground">
        Partidas da mais recente para a mais antiga, com filtro por clube. “Ver duelos” abre a
        partida.
      </p>

      {dialog.open && (
        <NewMatchDialog clubs={dialog.clubs} onClose={dialog.close} onPlayed={dialog.onPlayed} />
      )}
    </div>
  )
}
