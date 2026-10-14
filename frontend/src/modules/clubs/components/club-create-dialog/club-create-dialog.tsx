import { CircleAlert, Shield, Wallet } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { FormField } from '@/components/form/form-field/form-field'
import { InputWithIcon } from '@/components/form/input-with-icon/input-with-icon'
import { Input } from '@/components/ui/input'
import { formatMoney } from '@/lib/format'
import { INITIAL_CASH } from '../../clubs.constants'
import { useClubCreateDialog } from './club-create-dialog.hook'
import type { ClubCreateDialogProps } from './club-create-dialog.types'

const FORM_ID = 'club-create-form'

export function ClubCreateDialog({ onClose, onCreated }: ClubCreateDialogProps) {
  const { form, errors, isSubmitting, apiError, conflict, onSubmit } = useClubCreateDialog({
    onCreated,
  })

  return (
    <ActionDialog
      size="lg"
      className="sm:max-w-[480px]"
      title="Novo clube"
      description="Informe o nome e a sigla do clube."
      busy={isSubmitting}
      onClose={onClose}
      confirm={{ label: 'Criar clube', busyLabel: 'Criando…', form: FORM_ID }}
    >
      {apiError && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <span className="font-medium">Não foi possível criar o clube</span>
            <br />
            {apiError}
          </p>
        </div>
      )}

      <form id={FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <FormField
          id="club-name"
          label="Nome"
          hint="De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube."
          error={errors.name?.message}
        >
          <InputWithIcon
            icon={Shield}
            id="club-name"
            autoComplete="off"
            aria-invalid={!!errors.name || conflict === 'name'}
            aria-describedby="club-name-message"
            {...form.register('name')}
          />
        </FormField>

        <FormField
          id="club-acronym"
          label="Sigla"
          hint="3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira letra do nome."
          error={errors.acronym?.message}
        >
          <Controller
            control={form.control}
            name="acronym"
            render={({ field }) => (
              <Input
                id="club-acronym"
                className="h-9 uppercase"
                maxLength={3}
                autoComplete="off"
                aria-invalid={!!errors.acronym || conflict === 'acronym'}
                aria-describedby="club-acronym-message"
                {...field}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            )}
          />
        </FormField>

        <p className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
          <Wallet className="size-4 shrink-0" aria-hidden />O clube começa com{' '}
          {formatMoney(INITIAL_CASH)} em caixa e sem jogadores.
        </p>
      </form>
    </ActionDialog>
  )
}
