import { Trash2 } from 'lucide-react'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { ClubTag } from '../club-tag/club-tag'
import { PlayerSummary } from '../player-summary/player-summary'
import type { PlayerDeleteDialogProps } from './player-delete-dialog.types'

/** Confirmação de exclusão lógica (RN09); só aparece para jogador livre */
export function PlayerDeleteDialog({
  player,
  isDeleting,
  onClose,
  onConfirm,
}: PlayerDeleteDialogProps) {
  return (
    <ActionDialog
      alert
      size="sm"
      title={`Excluir ${player.name}?`}
      description="O jogador sai da lista e da busca, mas as transações e as partidas antigas dele continuam como foram gravadas."
      busy={isDeleting}
      onClose={onClose}
      confirm={{
        label: 'Excluir jogador',
        busyLabel: 'Excluindo…',
        variant: 'destructive',
        icon: <Trash2 />,
        onClick: onConfirm,
      }}
    >
      <PlayerSummary player={player} aside={<ClubTag />} />
    </ActionDialog>
  )
}
