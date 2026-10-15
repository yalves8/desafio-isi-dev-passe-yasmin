import { ArrowLeft, HeartPulse, Volleyball } from 'lucide-react'
import { Link } from 'react-router'
import { ErrorState } from '@/components/feedback/states'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DuelsTable } from '../../components/duels-table/duels-table'
import { MatchPitch } from '../../components/match-pitch/match-pitch'
import { MatchScoreboard } from '../../components/match-scoreboard/match-scoreboard'
import { useMatchDetailsPage } from './match-details-page.hook'

/** Partida com os duelos (Figma L03): mesma tela logo depois de jogar e ao abrir do histórico */
export function MatchDetailsPage() {
  const { match, clubsById } = useMatchDetailsPage()
  const back = (
    <Button variant="ghost" size="md" className="self-start px-3" asChild>
      <Link to="/partidas">
        <ArrowLeft /> Voltar para partidas
      </Link>
    </Button>
  )

  if (match.error) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <ErrorState message={match.error} onRetry={match.onRetry} />
      </div>
    )
  }
  if (!match.data) {
    return (
      <div role="status" aria-label="Carregando partida" className="flex flex-col gap-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const data = match.data
  return (
    <div className="flex flex-col gap-6">
      {back}
      <div className="rounded-xl border bg-card p-6 shadow-2xs">
        <MatchScoreboard match={data} clubsById={clubsById} showFormation />
      </div>

      <section
        aria-labelledby="pitch-title"
        className="overflow-hidden rounded-xl border bg-card shadow-2xs"
      >
        <header className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="pitch-title" className="text-base font-semibold">
              Em campo
            </h2>
            <p className="text-xs text-muted-foreground">
              Titulares de cada clube na formação da partida e os valores usados nos duelos, já com
              o efeito da condição.
            </p>
          </div>
          <p className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex size-4 items-center justify-center rounded-full bg-amber-600 text-white">
                <HeartPulse className="size-2.5" aria-hidden />
              </span>
              Mal condicionado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Volleyball className="size-4" aria-hidden /> Gol no duelo
            </span>
          </p>
        </header>
        <div className="p-4">
          <MatchPitch match={data} />
        </div>
      </section>

      <section
        aria-labelledby="duels-title"
        className="overflow-hidden rounded-xl border bg-card shadow-2xs"
      >
        <header className="border-b px-5 py-4">
          <h2 id="duels-title" className="text-base font-semibold">
            Duelos
          </h2>
          <p className="text-xs text-muted-foreground">
            Os 3 ataques do mandante e depois os 3 do visitante. Os jogadores de linha vão do 1º (o
            mais recuado) ao 4º (o mais avançado), pela ordem do elenco: o 4º ataca o goleiro, o 3º
            ataca o 1º e o 2º ataca o 2º.
          </p>
        </header>
        <DuelsTable match={data} clubsById={clubsById} />
      </section>

      <p className="text-xs text-muted-foreground">
        Os valores e a condição de cada titular vêm gravados nos duelos devolvidos pela API: mal
        condicionado joga com 15% a menos (RN20).
      </p>
    </div>
  )
}
