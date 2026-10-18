import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { clubsService } from '@/api/clubs.service'
import type { Club } from '@/api/types'
import { useInlineAction } from '@/hooks/use-inline-action'
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
  const save = useInlineAction((input: CreateClubInput) => clubsService.create(input), {
    errorTitle: 'Não foi possível criar o clube',
  })
  const apiError = save.error?.message

  const onSubmit = form.handleSubmit(async (input) => {
    const result = await save.run(input)
    if (result.ok) onCreated(result.data)
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
