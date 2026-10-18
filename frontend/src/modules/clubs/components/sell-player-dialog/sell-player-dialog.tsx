import { HandCoins, Loader2, RefreshCw } from 'lucide-react'
import { InfoList } from '@/components/data-display/info-list/info-list'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { AlertMessage } from '@/components/feedback/alert-message/alert-message'
import { InfoNote } from '@/components/feedback/info-note/info-note'
import { formatDateTime, formatInteger, formatMoney } from '@/lib/format'
import { PlayerSummary } from '@/modules/players'
import { PenaltyRateTag } from '../penalty-rate-tag/penalty-rate-tag'
import type { SellPlayerDialogProps } from './sell-player-dialog.types'

/**
 * Confirmação da venda com o contrato como a API devolveu agora. Multa, comissão e crédito
 * são calculados pela API no momento da venda (RN15 e RN16) e aparecem depois de vender.
 */
export function SellPlayerDialog({
  player,
  clubName,
  isStarter,
  isSelling,
  error,
  onClose,
  onConfirm,
}: SellPlayerDialogProps) {
  const contract = player.contract
  // Sem resposta da API a venda pode não ter acontecido: o botão vira "Tentar de novo"
  const retry = error?.kind === 'network'
  return (
    <ActionDialog
      title={`Vender ${player.name}?`}
      description={`O jogador sai do elenco do ${clubName} e volta a ficar livre.`}
      busy={isSelling}
      onClose={onClose}
      confirm={{
        label: retry ? 'Tentar de novo' : 'Confirmar venda',
        busyLabel: 'Vendendo…',
        icon: isSelling ? (
          <Loader2 className="animate-spin" />
        ) : retry ? (
          <RefreshCw />
        ) : (
          <HandCoins />
        ),
        onClick: onConfirm,
      }}
    >
      {error ? (
        <AlertMessage variant="error" title={retry ? 'Sem conexão' : 'A venda foi recusada'}>
          {error.message}
        </AlertMessage>
      ) : (
        isStarter && (
          <AlertMessage variant="warning" title={`${player.name} é titular`}>
            Ao vender, ele sai da escalação, e o {clubName} só volta a jogar partidas depois de
            escalar de novo os 5 titulares.
          </AlertMessage>
        )
      )}

      <PlayerSummary player={player} showMarketValue />

      {contract && (
        <InfoList
          items={[
            { label: 'Valor de compra', value: formatMoney(contract.purchase_value) },
            { label: 'Fim da fidelidade', value: formatDateTime(contract.loyalty_until) },
            { label: 'Dias restantes', value: formatInteger(contract.remaining_days) },
            {
              label: '% de multa se vender agora',
              value: <PenaltyRateTag rate={contract.penalty_rate} />,
            },
          ]}
        />
      )}

      <InfoNote>
        A venda é pelo valor de mercado do momento. Multa (teto de 10,00), lucro, comissão e crédito
        são calculados ao confirmar.
      </InfoNote>

      {isSelling && (
        <InfoNote variant="outline" role="status">
          Enviando a venda. Os botões ficam desabilitados até a resposta.
        </InfoNote>
      )}
    </ActionDialog>
  )
}
