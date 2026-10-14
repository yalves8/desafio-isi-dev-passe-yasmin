import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { clubsService } from '@/api/clubs.service'
import type { Club } from '@/api/types'
import { useAction } from '@/hooks/use-action'
import {
  createClubSchema,
  type CreateClubFormInput,
  type CreateClubInput,
} from '../../club-form.validation'
import { conflictField } from './club-create-dialog.utils'

export function useClubCreateDialog({ onCreated }: { onCreated: (club: Club) => void }) {
  const form = useForm<CreateClubFormInput, unknown, CreateClubInput>({
    resolver: zodResolver(createClubSchema),
    mode: 'onTouched',
    defaultValues: { name: '', acronym: '' },
  })
  // Nome ou sigla repetidos e o limite de 20 clubes só a API sabe: o 409 aparece no diálogo
  const [apiError, setApiError] = useState<string>()
  const save = useAction((input: CreateClubInput) => clubsService.create(input), {
    errorTitle: 'Não foi possível criar o clube',
    toastOnError: false,
  })

  const onSubmit = form.handleSubmit(async (input) => {
    setApiError(undefined)
    const result = await save.run(input)
    if (result.ok) onCreated(result.data)
    else setApiError(result.error)
  })

  return {
    form,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting || save.isPending,
    apiError,
    /** Campo que o 409 recusou, marcado em vermelho junto do alerta */
    conflict: conflictField(apiError),
    onSubmit,
  }
}
