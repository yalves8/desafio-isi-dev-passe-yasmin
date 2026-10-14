import { ArrowRight, CircleCheck } from 'lucide-react'
import { InfoList } from '@/components/data-display/info-list/info-list'
import { Tag } from '@/components/data-display/tag/tag'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { Button } from '@/components/ui/button'
import { formatDate, formatMoney, formatTime } from '@/lib/format'
import type { PurchaseResultDialogProps } from './purchase-result-dialog.types'

/** Resultado da compra exatamente como a API devolveu (RN12, RN13 e RN17) */
export function PurchaseResultDialog({
  purchase,
  clubName,
  onClose,
  onViewClub,
}: PurchaseResultDialogProps) {
  const { contract } = purchase
  return (
    <ActionDialog
      className="sm:max-w-[500px]"
      icon={
        <span className="flex size-9 items-center justify-center rounded-full bg-green-50 text-green-700">
          <CircleCheck className="size-5" aria-hidden />
        </span>
      }
      title="Compra concluída"
      description={`${purchase.player_name} agora é do ${clubName}.`}
      onClose={onClose}
      cancelLabel={false}
      secondaryActions={
        <Button variant="outline" size="md" onClick={onViewClub}>
          Ver clube <ArrowRight />
        </Button>
      }
      confirm={{ label: 'Fechar', onClick: onClose }}
    >
      <InfoList
        items={[
          {
            label: 'Valor',
            description: 'Valor de mercado no momento da compra',
            value: formatMoney(purchase.value),
          },
          {
            label: 'Taxa',
            description:
              purchase.fee > 0
                ? '5% do valor, porque passa de 30,00'
                : 'Sem taxa: o valor não passa de 30,00',
            value: formatMoney(purchase.fee),
          },
          {
            label: 'Custo total',
            description: 'Valor + taxa',
            // O custo é o que saiu do caixa, como a API gravou
            value: formatMoney(-purchase.cash_change),
            highlight: true,
          },
          {
            label: 'Fim da fidelidade',
            value: `${formatDate(contract.loyalty_until)}, ${formatTime(contract.loyalty_until)}`,
          },
          {
            label: 'Contrato',
            value: (
              <Tag variant="success">
                <span className="size-1.5 rounded-full bg-current" aria-hidden />
                {contract.status}
              </Tag>
            ),
          },
          {
            label: `Novo caixa do ${clubName}`,
            value: formatMoney(purchase.club_cash),
            highlight: true,
          },
        ]}
      />
    </ActionDialog>
  )
}
