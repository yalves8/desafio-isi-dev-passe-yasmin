import { Info, UserRound } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { FormField } from '@/components/form/form-field/form-field'
import { InputWithIcon } from '@/components/form/input-with-icon/input-with-icon'
import { NumberField } from '@/components/form/number-field/number-field'
import { ATTRIBUTE_FIELDS } from '../../players.constants'
import { AttributesPreview } from '../attributes-preview/attributes-preview'
import { LockedField } from '../locked-field/locked-field'
import { PositionPicker } from '../position-picker/position-picker'
import { usePlayerCreateDialog } from './player-create-dialog.hook'
import type { PlayerCreateDialogProps } from './player-create-dialog.types'

const FORM_ID = 'player-create-form'

export function PlayerCreateDialog({ onClose, onCreated }: PlayerCreateDialogProps) {
  const { form, errors, isSubmitting, showErrorSummary, preview, attributesError, onSubmit } =
    usePlayerCreateDialog({ onCreated })
  const { register } = form

  return (
    <ActionDialog
      size="xl"
      title="Novo jogador"
      description={
        showErrorSummary
          ? 'Corrija os campos destacados para salvar.'
          : 'Preencha os dados e os indicadores técnicos. O valor base, o overall e o valor de mercado são calculados ao salvar.'
      }
      busy={isSubmitting}
      onClose={onClose}
      confirm={{ label: 'Salvar jogador', busyLabel: 'Salvando…', form: FORM_ID }}
      footerNote={
        <span className="flex items-center gap-1.5">
          <Info className="size-3.5" aria-hidden />O jogador começa livre e Apto.
        </span>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <FormField
          id="player-name"
          label="Nome"
          hint="De 3 a 100 caracteres, com pelo menos duas palavras e sem números."
          error={errors.name?.message}
        >
          <InputWithIcon
            icon={UserRound}
            id="player-name"
            autoComplete="off"
            aria-invalid={!!errors.name}
            aria-describedby="player-name-message"
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
                invalid={!!errors.position}
              />
            )}
          />
          {errors.position && <p className="text-xs text-destructive">{errors.position.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            id="player-age"
            label="Idade"
            hint="De 16 a 45 anos."
            error={errors.age?.message}
            registration={register('age')}
          />
          <NumberField
            id="player-agility"
            label="Agilidade"
            hint="De 1 a 100 (até 85 com 35 anos ou mais)."
            error={errors.agility?.message}
            registration={register('agility')}
          />
          <LockedField label="Valor base (moedas)" hint="Calculado no cadastro." />
        </div>

        <div className="flex flex-col gap-4 border-t pt-5">
          <div>
            <h3 className="text-base font-semibold">Indicadores técnicos</h3>
            <p className="text-sm text-muted-foreground">
              Seis atributos e o potencial, de 1 a 99. Não mudam depois do cadastro; a soma dos seis
              atributos não pode passar de 480.
            </p>
            {attributesError && (
              <p role="alert" className="mt-2 text-xs text-destructive">
                {attributesError}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_244px]">
            <div className="grid grid-cols-2 content-start gap-x-3 gap-y-4 sm:grid-cols-4">
              {ATTRIBUTE_FIELDS.map((field) => (
                <NumberField
                  key={field.key}
                  id={`player-${field.key}`}
                  label={field.label}
                  error={errors[field.key]?.message}
                  registration={register(field.key)}
                />
              ))}
              <NumberField
                id="player-potential"
                label="Potencial"
                hint="≥ maior atributo; igual a ele com 33+ anos"
                error={errors.potential?.message}
                registration={register('potential')}
              />
              <LockedField label="Overall" hint="Calculado automaticamente" />
            </div>
            <AttributesPreview preview={preview} />
          </div>
        </div>
      </form>
    </ActionDialog>
  )
}
