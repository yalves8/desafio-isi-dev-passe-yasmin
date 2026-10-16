import { Plus, Shield } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/format'
import { INITIAL_CASH, MAX_CLUBS } from '../../clubs.constants'
import { ClubCreateDialog } from '../../components/club-create-dialog/club-create-dialog'
import { ClubsTable } from '../../components/clubs-table/clubs-table'
import { useClubsPage } from './clubs-page.hook'

export function ClubsPage() {
  const { header, table, dialog } = useClubsPage()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Shield}
        title="Clubes"
        description={`Cada clube começa com ${formatMoney(INITIAL_CASH)} em caixa e sem jogadores. A liga aceita no máximo ${MAX_CLUBS} clubes.`}
        actions={
          <Button size="md" onClick={header.onCreate} data-testid="clubs-create">
            <Plus /> Novo clube
          </Button>
        }
      />

      <ClubsTable {...table} />

      {table.clubs.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Clubes pelo nome por padrão ou pelo patrimônio, com empate desfeito pelo nome. Caixa,
          valor do elenco e patrimônio vêm calculados pela API.
        </p>
      )}

      {dialog.open && <ClubCreateDialog onClose={dialog.close} onCreated={dialog.onCreated} />}
    </div>
  )
}
