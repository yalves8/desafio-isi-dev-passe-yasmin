import { Calendar, Clock, Loader2, RefreshCw, ShoppingCart } from 'lucide-react'
import type { MouseEvent } from 'react'
import { Controller } from 'react-hook-form'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { AlertMessage } from '@/components/feedback/alert-message/alert-message'
import { InfoNote } from '@/components/feedback/info-note/info-note'
import { ClubSelect } from '@/components/form/club-select/club-select'
import { FormField } from '@/components/form/form-field/form-field'
import { InputWithIcon } from '@/components/form/input-with-icon/input-with-icon'
import { formatMoney } from '@/lib/format'
import { PlayerSummary } from '../player-summary/player-summary'
import { useBuyPlayerDialog } from './buy-player-dialog.hook'
import type { BuyPlayerDialogProps } from './buy-player-dialog.types'

const FORM_ID = 'buy-player-form'
// Só o ícone à esquerda, como no Figma: o seletor nativo abre ao clicar no campo
const PICKER_INPUT = '[&::-webkit-calendar-picker-indicator]:hidden'

function openPicker(event: MouseEvent<HTMLInputElement>) {
  try {
    event.currentTarget.showPicker()
  } catch {
    // Navegador sem showPicker: o campo continua digitável
  }
}

export function BuyPlayerDialog({ player, clubs, onClose, onBought }: BuyPlayerDialogProps) {
  const { form, errors, isSubmitting, club, dateRange, error, onSubmit } = useBuyPlayerDialog({
    player,
    clubs,
    onBought,
  })
  const retry = error?.kind === 'network'

  return (
    <ActionDialog
      size="lg"
      title="Comprar jogador"
      description="Escolha o clube comprador e até quando vai a fidelidade do contrato."
      busy={isSubmitting}
      onClose={onClose}
      confirm={{
        label: retry ? 'Tentar de novo' : 'Confirmar compra',
        busyLabel: 'Comprando…',
        form: FORM_ID,
        icon: isSubmitting ? (
          <Loader2 className="animate-spin" />
        ) : retry ? (
          <RefreshCw />
        ) : (
          <ShoppingCart />
        ),
      }}
    >
      {error && (
        <AlertMessage variant="error" title={retry ? 'Sem conexão' : 'Compra recusada'}>
          {error.message}
        </AlertMessage>
      )}

      <PlayerSummary player={player} showMarketValue />

      <form id={FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <FormField
          id="buy-club"
          label="Clube comprador"
          hint={
            club
              ? `Caixa atual: ${formatMoney(club.cash)}. O custo total (valor + taxa) pode ir até 50% do caixa.`
              : 'O custo total (valor + taxa) pode ir até 50% do caixa do clube.'
          }
          error={errors.clubId?.message}
        >
          <Controller
            control={form.control}
            name="clubId"
            render={({ field }) => (
              <ClubSelect
                id="buy-club"
                clubs={clubs}
                showCash
                value={field.value ? Number(field.value) : undefined}
                onChange={(clubId) => field.onChange(String(clubId))}
                onBlur={field.onBlur}
                invalid={!!errors.clubId}
                disabled={isSubmitting}
              />
            )}
          />
        </FormField>

        <FormField
          id="buy-date"
          label="Fim da fidelidade"
          hint="Depois do momento da compra e até 1.095 dias. Horário de Brasília; enviado com o fuso (-03:00)."
          error={errors.date?.message ?? errors.time?.message}
        >
          <div className="flex gap-2">
            <InputWithIcon
              icon={Calendar}
              id="buy-date"
              type="date"
              min={dateRange.min}
              max={dateRange.max}
              className={PICKER_INPUT}
              onClick={openPicker}
              containerClassName="flex-1"
              disabled={isSubmitting}
              aria-invalid={!!errors.date}
              aria-describedby="buy-date-message"
              {...form.register('date')}
            />
            <InputWithIcon
              icon={Clock}
              id="buy-time"
              type="time"
              className={PICKER_INPUT}
              onClick={openPicker}
              aria-label="Hora do fim da fidelidade"
              containerClassName="w-32"
              disabled={isSubmitting}
              aria-invalid={!!errors.time}
              aria-describedby="buy-date-message"
              {...form.register('time')}
            />
          </div>
        </FormField>
      </form>

      <InfoNote>
        A taxa é de 5% do valor de mercado, só quando ele passa de 30,00. Taxa, custo e novo caixa
        são calculados ao confirmar.
      </InfoNote>

      {isSubmitting && (
        <InfoNote variant="outline" role="status">
          Enviando a compra. Os botões ficam desabilitados até a resposta.
        </InfoNote>
      )}
    </ActionDialog>
  )
}
