import { HeartPulse } from 'lucide-react'
import { SoccerBall } from '@/components/data-display/soccer-ball/soccer-ball'
import { LegendItem } from '@/components/data-display/legend-item/legend-item'
import { PageSkeleton } from '@/components/feedback/page-skeleton/page-skeleton'
import { ErrorState } from '@/components/feedback/states'
import { BackLink } from '@/components/layout/back-link/back-link'
import { SectionCard } from '@/components/layout/section-card/section-card'
import { Skeleton } from '@/components/ui/skeleton'
import { DuelsTable } from '../../components/duels-table/duels-table'
import { MatchPitch } from '../../components/match-pitch/match-pitch'
import { MatchScoreboard } from '../../components/match-scoreboard/match-scoreboard'
import { useMatchDetailsPage } from './match-details-page.hook'

/** Partida com os duelos (Figma L03): mesma tela logo depois de jogar e ao abrir do histórico */
export function MatchDetailsPage() {
  const { match, clubsById } = useMatchDetailsPage()
  const back = (
    <BackLink to="/partidas" label="Voltar para partidas" variant="ghost" className="self-start" />
  )

  if (match.error) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <ErrorState
          bordered
          title="Não foi possível carregar a partida"
          message={match.error}
          onRetry={match.onRetry}
        />
      </div>
    )
  }
  if (!match.data) {
    return (
      <PageSkeleton label="Carregando partida">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </PageSkeleton>
    )
  }

  const data = match.data
  return (
    <div className="flex flex-col gap-6">
      {back}
      <div className="rounded-xl border bg-card p-6 shadow-2xs">
        <MatchScoreboard match={data} clubsById={clubsById} showFormation />
      </div>

      <SectionCard
        title="Em campo"
        description="Titulares de cada clube na formação da partida e os valores usados nos duelos, já com o efeito da condição."
        actions={
          <p className="flex items-center gap-4 text-xs text-muted-foreground">
            <LegendItem
              marker={
                <span className="flex size-4 items-center justify-center rounded-full bg-amber-600 text-white">
                  <HeartPulse className="size-2.5" aria-hidden />
                </span>
              }
            >
              Mal condicionado
            </LegendItem>
            <LegendItem marker={<SoccerBall className="size-4 text-zinc-900" aria-hidden />}>
              Gol no duelo
            </LegendItem>
          </p>
        }
      >
        <div className="p-4">
          <MatchPitch match={data} />
        </div>
      </SectionCard>

      <SectionCard
        title="Duelos"
        description="Os 3 ataques do mandante e depois os 3 do visitante. Os jogadores de linha vão do 1º (o mais recuado) ao 4º (o mais avançado), pela ordem do elenco: o 4º ataca o goleiro, o 3º ataca o 1º e o 2º ataca o 2º."
      >
        <DuelsTable match={data} clubsById={clubsById} />
      </SectionCard>

      <p className="text-xs text-muted-foreground">
        Os valores e a condição de cada titular vêm gravados nos duelos devolvidos pela API: mal
        condicionado joga com 15% a menos (RN20).
      </p>
    </div>
  )
}
