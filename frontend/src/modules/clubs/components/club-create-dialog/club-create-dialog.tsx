import { Shield, Wallet } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { AlertMessage } from '@/components/feedback/alert-message/alert-message'
import { InfoNote } from '@/components/feedback/info-note/info-note'
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
        <AlertMessage variant="error" title="Não foi possível criar o clube">
          {apiError}
        </AlertMessage>
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

        <InfoNote icon={Wallet}>
          O clube começa com {formatMoney(INITIAL_CASH)} em caixa e sem jogadores.
        </InfoNote>
      </form>
    </ActionDialog>
  )
}
