import {
  Calendar,
  CircleAlert,
  Clock,
  Info,
  Loader2,
  RefreshCw,
  Shield,
  ShoppingCart,
} from 'lucide-react'
import type { MouseEvent } from 'react'
import { Controller } from 'react-hook-form'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { FormField } from '@/components/form/form-field/form-field'
import { InputWithIcon } from '@/components/form/input-with-icon/input-with-icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const { form, errors, isSubmitting, club, error, onSubmit } = useBuyPlayerDialog({
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
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <span className="font-medium">{retry ? 'Sem conexão' : 'Compra recusada'}</span>
            <br />
            {error.message}
          </p>
        </div>
      )}

      <PlayerSummary
        player={player}
        aside={
          <p className="text-right leading-tight">
            <span className="block text-xs text-muted-foreground">Valor de mercado</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatMoney(player.market_value)}
            </span>
          </p>
        }
      />

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
              <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                <SelectTrigger
                  id="buy-club"
                  className="h-9 w-full gap-2 pl-3 text-left *:data-[slot=select-value]:flex-1"
                  aria-invalid={!!errors.clubId}
                  aria-describedby="buy-club-message"
                  onBlur={field.onBlur}
                >
                  <Shield className="text-muted-foreground" aria-hidden />
                  <SelectValue placeholder="Escolha o clube" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} ({c.acronym}) · caixa {formatMoney(c.cash)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      <p className="flex gap-2.5 rounded-lg border bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
        <Info className="mt-px size-4 shrink-0" aria-hidden />A taxa é de 5% do valor de mercado, só
        quando ele passa de 30,00. Taxa, custo e novo caixa são calculados ao confirmar.
      </p>

      {isSubmitting && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs text-muted-foreground"
        >
          <Info className="size-3.5 shrink-0" aria-hidden />
          Enviando a compra. Os botões ficam desabilitados até a resposta.
        </p>
      )}
    </ActionDialog>
  )
}
