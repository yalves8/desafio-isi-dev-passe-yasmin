import { ListOrdered, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { RecentMatches } from '../../components/recent-matches/recent-matches'
import { StandingsCriteria } from '../../components/standings-criteria/standings-criteria'
import { StandingsTable } from '../../components/standings-table/standings-table'
import { useStandingsPage } from './standings-page.hook'

/** Classificação (Figma L05): tabela na ordem devolvida por GET /standings */
export function StandingsPage() {
  const { header, table, recent, total } = useStandingsPage()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={ListOrdered}
        title="Classificação"
        description="Todos os clubes, com 3 pontos por vitória e 1 por empate."
        actions={
          <Button
            variant="outline"
            size="md"
            onClick={header.onCreate}
            data-testid="standings-create"
          >
            <Plus /> Nova partida
          </Button>
        }
      />
      <div className="grid items-start gap-4 xl:grid-cols-[1fr_300px]">
        <StandingsTable {...table} />
        <div className="flex flex-col gap-4">
          <RecentMatches matches={recent} />
          <StandingsCriteria />
        </div>
      </div>
      {total > 0 && (
        <p className="text-xs text-muted-foreground">
          Classificação de 1 a {total}, com os clubes sem partidas zerados. Pontos, saldo e posição
          são calculados a cada consulta, nunca gravados (RN21).
        </p>
      )}
    </div>
  )
}
