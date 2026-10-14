import { Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { ActiveFilters } from '../../components/active-filters/active-filters'
import { PlayerFilters } from '../../components/player-filters/player-filters'
import { PlayerConditionDialog } from '../../components/player-condition-dialog/player-condition-dialog'
import { PlayerCreateDialog } from '../../components/player-create-dialog/player-create-dialog'
import { PlayerCreatedDialog } from '../../components/player-created-dialog/player-created-dialog'
import { PlayerDeleteDialog } from '../../components/player-delete-dialog/player-delete-dialog'
import { PlayerDetailsSheet } from '../../components/player-details-sheet/player-details-sheet'
import { PlayerEditDialog } from '../../components/player-edit-dialog/player-edit-dialog'
import { PlayersTable } from '../../components/players-table/players-table'
import { usePlayersPage } from './players-page.hook'

export function PlayersPage() {
  const { header, filters, activeFilters, table, dialog } = usePlayersPage()
  const current = dialog.current

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Users}
        title="Jogadores"
        description="Cadastre jogadores, acompanhe os indicadores e compre os que estão livres."
        actions={
          <Button size="md" onClick={header.onCreate}>
            <Plus /> Novo jogador
          </Button>
        }
      />

      <PlayerFilters {...filters} />
      <ActiveFilters {...activeFilters} />
      <PlayersTable {...table} />

      <p className="text-xs text-muted-foreground">
        Overall e valor de mercado são calculados a cada consulta. A busca ignora maiúsculas,
        minúsculas e acentos.
      </p>

      {current?.type === 'create' && (
        <PlayerCreateDialog onClose={dialog.close} onCreated={dialog.onCreated} />
      )}
      {current?.type === 'created' && (
        <PlayerCreatedDialog
          player={current.player}
          onClose={dialog.close}
          onDetails={() => dialog.open('details')(current.player)}
        />
      )}
      {current?.type === 'details' && (
        <PlayerDetailsSheet
          player={current.player}
          club={dialog.clubOf(current.player)}
          onClose={dialog.close}
          onEdit={() => dialog.open('edit')(current.player)}
          onCondition={() => dialog.open('condition')(current.player)}
        />
      )}
      {current?.type === 'edit' && (
        <PlayerEditDialog
          player={current.player}
          onClose={dialog.close}
          onUpdated={dialog.onUpdated}
        />
      )}
      {current?.type === 'condition' && (
        <PlayerConditionDialog
          player={current.player}
          club={dialog.clubOf(current.player)}
          isSubmitting={dialog.condition.isSubmitting}
          onClose={dialog.close}
          onConfirm={(condition) => void dialog.condition.onConfirm(current.player, condition)}
        />
      )}
      {current?.type === 'delete' && (
        <PlayerDeleteDialog
          player={current.player}
          isDeleting={dialog.remove.isDeleting}
          onClose={dialog.close}
          onConfirm={() => void dialog.remove.onConfirm(current.player)}
        />
      )}
    </div>
  )
}
