import { CircleCheck } from 'lucide-react'
import { InfoList } from '@/components/data-display/info-list/info-list'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { formatInteger, formatMoney } from '@/lib/format'
import type { SaleResultDialogProps } from './sale-result-dialog.types'

const signed = (value: number) => `${value > 0 ? '+' : ''}${formatMoney(value)}`

/** Resultado da venda exatamente como a API devolveu (RN15, RN16 e RN17) */
export function SaleResultDialog({ sale, onClose }: SaleResultDialogProps) {
  return (
    <ActionDialog
      className="sm:max-w-[540px]"
      icon={
        <span className="flex size-9 items-center justify-center rounded-full bg-green-50 text-green-700">
          <CircleCheck className="size-5" aria-hidden />
        </span>
      }
      title="Jogador vendido"
      description={`${sale.player_name} ficou livre. Contrato ${sale.contract_status === 'RESCINDIDO' ? 'rescindido, com multa' : 'encerrado, sem multa'}.`}
      onClose={onClose}
      cancelLabel={false}
      confirm={{ label: 'Fechar', onClick: onClose }}
    >
      <InfoList
        items={[
          {
            label: 'Valor de venda',
            description: 'Valor de mercado no momento',
            value: formatMoney(sale.value),
          },
          {
            label: 'Multa',
            description: `${sale.penalty_rate}% com ${formatInteger(sale.remaining_days)} dias restantes`,
            value: formatMoney(sale.penalty),
          },
          {
            label: 'Lucro',
            description: `Sobre o valor de compra de ${formatMoney(sale.purchase_value)}`,
            value: sale.profit === null ? '—' : signed(sale.profit),
          },
          { label: 'Comissão', description: 'Só quando há lucro', value: formatMoney(sale.fee) },
          { label: 'Crédito no caixa', value: signed(sale.cash_change), highlight: true },
          { label: 'Novo caixa', value: formatMoney(sale.club_cash) },
        ]}
      />
    </ActionDialog>
  )
}
