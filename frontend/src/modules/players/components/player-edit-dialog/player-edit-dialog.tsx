import { Lock, UserRound } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { FormField } from '@/components/form/form-field/form-field'
import { InputWithIcon } from '@/components/form/input-with-icon/input-with-icon'
import { NumberField } from '@/components/form/number-field/number-field'
import { formatMoney } from '@/lib/format'
import { PositionPicker } from '../position-picker/position-picker'
import { usePlayerEditDialog } from './player-edit-dialog.hook'
import type { PlayerEditDialogProps } from './player-edit-dialog.types'

const FORM_ID = 'player-edit-form'

export function PlayerEditDialog({ player, onClose, onUpdated }: PlayerEditDialogProps) {
  const { form, errors, isSubmitting, lockedPosition, onSubmit } = usePlayerEditDialog({
    player,
    onUpdated,
  })
  const { register } = form

  return (
    <ActionDialog
      size="lg"
      title="Editar jogador"
      description="Edite nome, posição, idade e agilidade. Os demais dados não mudam."
      busy={isSubmitting}
      onClose={onClose}
      confirm={{ label: 'Salvar alterações', busyLabel: 'Salvando…', form: FORM_ID }}
    >
      <form id={FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <FormField
          id="edit-name"
          label="Nome"
          hint="De 3 a 100 caracteres, com pelo menos duas palavras e sem números."
          error={errors.name?.message}
        >
          <InputWithIcon
            icon={UserRound}
            id="edit-name"
            autoComplete="off"
            aria-invalid={!!errors.name}
            aria-describedby="edit-name-message"
            {...register('name')}
          />
        </FormField>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Posição</span>
          <Controller
            control={form.control}
            name="position"
            render={({ field }) => (
              <PositionPicker
                value={field.value}
                onChange={field.onChange}
                lockedTo={lockedPosition}
              />
            )}
          />
          {lockedPosition && (
            <p className="text-xs text-muted-foreground">
              Jogador com clube não muda de posição: as outras posições ficam desabilitadas.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            id="edit-age"
            label="Idade"
            hint={`De 16 a 45, sem diminuir (atual: ${player.age}).`}
            error={errors.age?.message}
            registration={register('age')}
          />
          <NumberField
            id="edit-agility"
            label="Agilidade"
            hint="De 1 a 100 (até 85 com 35 anos ou mais)."
            error={errors.agility?.message}
            registration={register('agility')}
          />
        </div>

        <p className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
          <Lock className="size-3.5 shrink-0" aria-hidden />
          Não mudam depois do cadastro: valor base ({formatMoney(player.base_value)}), indicadores e
          potencial.
        </p>
      </form>
    </ActionDialog>
  )
}
