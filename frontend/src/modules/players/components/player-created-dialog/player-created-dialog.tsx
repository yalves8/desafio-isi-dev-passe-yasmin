import { CircleCheck, Eye } from 'lucide-react'
import { InfoList } from '@/components/data-display/info-list/info-list'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/format'
import { POSITION_LABEL } from '../../players.constants'
import type { PlayerCreatedDialogProps } from './player-created-dialog.types'

/** Mostra os valores que a API calculou ao salvar (a tela não recalcula nada) */
export function PlayerCreatedDialog({ player, onClose, onDetails }: PlayerCreatedDialogProps) {
  return (
    <ActionDialog
      className="sm:max-w-[540px]"
      icon={
        <span className="flex size-9 items-center justify-center rounded-full bg-green-50 text-green-700">
          <CircleCheck className="size-5" aria-hidden />
        </span>
      }
      title="Jogador cadastrado"
      description={`${player.name} entrou livre e Apto. Valores em moedas, calculados pela API ao salvar.`}
      onClose={onClose}
      cancelLabel={false}
      secondaryActions={
        <Button variant="outline" size="md" onClick={onDetails}>
          <Eye /> Ver detalhes
        </Button>
      }
      confirm={{ label: 'Fechar', onClick: onClose }}
    >
      <InfoList
        items={[
          {
            label: 'Valor base',
            description: 'Calculado no cadastro; não muda depois',
            value: formatMoney(player.base_value),
            highlight: true,
          },
          {
            label: 'Valor de mercado',
            description: 'Com condição, agilidade e idade',
            value: formatMoney(player.market_value),
          },
          {
            label: 'Overall',
            description: `Pelos pesos da posição ${POSITION_LABEL[player.position]}`,
            value: player.overall,
          },
        ]}
      />
    </ActionDialog>
  )
}
