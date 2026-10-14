import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { ErrorState } from '@/components/feedback/states'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ClubHeader } from '../../components/club-header/club-header'
import { ClubStats } from '../../components/club-stats/club-stats'
import { ClubTabs } from '../../components/club-tabs/club-tabs'
import { LineupEditor } from '../../components/lineup-editor/lineup-editor'
import { SaleResultDialog } from '../../components/sale-result-dialog/sale-result-dialog'
import { SellPlayerDialog } from '../../components/sell-player-dialog/sell-player-dialog'
import { SquadTable } from '../../components/squad-table/squad-table'
import { TransactionsHistory } from '../../components/transactions-history/transactions-history'
import { useClubDetailsPage } from './club-details-page.hook'

export function ClubDetailsPage() {
  const { club, squad, tabs, lineup, version, dialog } = useClubDetailsPage()
  const current = dialog.current

  if (club.error) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorState message={club.error} onRetry={club.onRetry} />
        <Button variant="outline" size="md" className="self-start" asChild>
          <Link to="/clubes">
            <ArrowLeft /> Voltar para os clubes
          </Link>
        </Button>
      </div>
    )
  }

  if (!club.data) {
    return (
      <div role="status" aria-label="Carregando clube" className="flex flex-col gap-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-31" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ClubHeader club={club.data} squadSize={squad.length} />
      <ClubStats club={club.data} squadSize={squad.length} />
      <ClubTabs {...tabs} />

      {tabs.value === 'elenco' && (
        <>
          <SquadTable players={squad} onSell={dialog.openSell} />
          {squad.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Valor de mercado, dias restantes e % de multa calculados pela API para uma venda
              agora. A multa tem teto de 10,00.
            </p>
          )}
        </>
      )}

      {tabs.value === 'escalacao' &&
        (lineup.error ? (
          <ErrorState message={lineup.error} onRetry={lineup.onRetry} />
        ) : lineup.data ? (
          <LineupEditor
            key={lineup.editorKey}
            clubName={club.data.name}
            squad={squad}
            lineup={lineup.data}
            isSaving={lineup.isSaving}
            saveError={lineup.saveError}
            onSave={lineup.onSave}
          />
        ) : (
          <Skeleton role="status" aria-label="Carregando escalação" className="h-96 w-full" />
        ))}

      {tabs.value === 'historico' && <TransactionsHistory club={club.data} version={version} />}

      {current?.type === 'sell' && (
        <SellPlayerDialog
          player={current.player}
          clubName={club.data.name}
          isSelling={dialog.isSelling}
          onClose={dialog.close}
          onConfirm={() => dialog.confirmSell(current.player)}
        />
      )}
      {current?.type === 'sold' && <SaleResultDialog sale={current.sale} onClose={dialog.close} />}
    </div>
  )
}
