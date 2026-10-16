import { History } from 'lucide-react'
import { InfoList } from '@/components/data-display/info-list/info-list'
import { Tag } from '@/components/data-display/tag/tag'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { Button } from '@/components/ui/button'
import { formatInteger, formatMoney, formatSigned, signedTone } from '@/lib/format'
import type { SaleResultDialogProps } from './sale-result-dialog.types'

/** Resultado da venda exatamente como a API devolveu (RN15, RN16 e RN17) */
export function SaleResultDialog({
  sale,
  clubName,
  wasStarter,
  onClose,
  onViewHistory,
}: SaleResultDialogProps) {
  // Com multa o contrato é rescindido; com a fidelidade cumprida, encerrado sem multa (RN15)
  const rescinded = sale.contract_status === 'RESCINDIDO'
  const profit = sale.profit ?? 0
  const description = [
    `${sale.player_name} voltou a ficar livre${wasStarter ? ' e saiu da escalação' : ''}.`,
    !rescinded && 'A fidelidade já tinha terminado, então não houve multa.',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <ActionDialog
      className="sm:max-w-[500px]"
      success
      title="Venda concluída"
      description={description}
      onClose={onClose}
      cancelLabel={false}
      secondaryActions={
        <Button variant="outline" size="md" onClick={onViewHistory}>
          <History /> Ver histórico
        </Button>
      }
      confirm={{ label: 'Fechar', onClick: onClose }}
    >
      <InfoList
        items={[
          { label: 'Valor de compra', value: formatMoney(sale.purchase_value) },
          {
            label: 'Valor de venda',
            description: 'Valor de mercado no momento da venda',
            value: formatMoney(sale.value),
          },
          { label: 'Dias restantes', value: formatInteger(sale.remaining_days) },
          {
            label: 'Multa',
            description: rescinded
              ? `${sale.penalty_rate}% do valor de venda, com teto de 10,00`
              : 'Fidelidade cumprida: sem multa',
            value: formatMoney(sale.penalty),
          },
          {
            label: 'Lucro',
            value: <span className={signedTone(profit)}>{formatSigned(profit)}</span>,
          },
          {
            label: 'Comissão',
            description:
              profit > 0 ? '10% do lucro até 10,00 + 20% do que passar' : 'Sem lucro: sem comissão',
            value: formatMoney(sale.fee),
          },
          {
            label: 'Crédito no caixa',
            description: 'Valor de venda − multa − comissão',
            value: formatSigned(sale.cash_change),
            highlight: true,
          },
          {
            label: 'Contrato',
            value: (
              <Tag variant={rescinded ? 'warning' : 'outline'} dot>
                {sale.contract_status}
              </Tag>
            ),
          },
          {
            label: `Novo caixa do ${clubName}`,
            value: formatMoney(sale.club_cash),
            highlight: true,
          },
        ]}
      />
    </ActionDialog>
  )
}
