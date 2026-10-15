import { HandCoins } from 'lucide-react'
import { InfoList } from '@/components/data-display/info-list/info-list'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { formatDateTime, formatInteger, formatMoney } from '@/lib/format'
import { ConditionBadge, PlayerSummary } from '@/modules/players'
import { PenaltyRateTag } from '../penalty-rate-tag/penalty-rate-tag'
import type { SellPlayerDialogProps } from './sell-player-dialog.types'

/**
 * Confirmação da venda com o contrato como a API devolveu agora. Multa, comissão e crédito
 * são calculados pela API no momento da venda (RN15 e RN16) e aparecem depois de vender.
 */
export function SellPlayerDialog({
  player,
  clubName,
  isSelling,
  onClose,
  onConfirm,
}: SellPlayerDialogProps) {
  const contract = player.contract
  return (
    <ActionDialog
      alert
      title={`Vender ${player.name}?`}
      description={`O jogador sai do ${clubName} e fica livre. Se for titular, sai da escalação.`}
      busy={isSelling}
      onClose={onClose}
      confirm={{
        label: 'Vender jogador',
        busyLabel: 'Vendendo…',
        icon: <HandCoins />,
        onClick: onConfirm,
      }}
    >
      <PlayerSummary player={player} aside={<ConditionBadge condition={player.condition} />} />
      {contract && (
        <InfoList
          items={[
            {
              label: 'Valor de mercado agora',
              description: 'É o valor de venda',
              value: formatMoney(player.market_value),
              highlight: true,
            },
            { label: 'Valor de compra', value: formatMoney(contract.purchase_value) },
            {
              label: 'Fim da fidelidade',
              value: formatDateTime(contract.loyalty_until),
            },
            { label: 'Dias restantes', value: formatInteger(contract.remaining_days) },
            {
              label: 'Multa por fidelidade',
              description: 'Sobre o valor de venda, com teto de 10,00',
              value: <PenaltyRateTag rate={contract.penalty_rate} />,
            },
          ]}
        />
      )}
      <p className="text-xs text-muted-foreground">
        A comissão só existe se houver lucro. Os valores finais são calculados pela API no momento
        da venda.
      </p>
    </ActionDialog>
  )
}
