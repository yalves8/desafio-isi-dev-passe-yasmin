import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { playersService } from '@/api/players.service'
import type { CreatePlayerInput, Player } from '@/api/types'
import { useAction } from '@/hooks/use-action'
import { createPlayerSchema, type CreatePlayerFormInput } from '../../player-form.validation'
import { getAttributesPreview } from './player-create-dialog.utils'

const EMPTY_FORM: CreatePlayerFormInput = {
  name: '',
  position: undefined as unknown as CreatePlayerFormInput['position'],
  age: '',
  agility: '',
  pace: '',
  shooting: '',
  passing: '',
  dribbling: '',
  defending: '',
  physical: '',
  potential: '',
}

/** Campos que não alimentam a prévia: erro neles não a invalida */
const NON_ATTRIBUTE_FIELDS = new Set(['name', 'position', 'root'])

export function usePlayerCreateDialog({ onCreated }: { onCreated: (player: Player) => void }) {
  const form = useForm<CreatePlayerFormInput, unknown, CreatePlayerInput>({
    resolver: zodResolver(createPlayerSchema),
    mode: 'onTouched',
    defaultValues: EMPTY_FORM,
  })
  const { errors, submitCount } = form.formState
  const values = useWatch({ control: form.control })
  const save = useAction((input: CreatePlayerInput) => playersService.create(input), {
    errorTitle: 'Não foi possível cadastrar',
  })

  const errorKeys = Object.keys(errors)
  const hasErrors = errorKeys.length > 0

  const onSubmit = form.handleSubmit(async (input) => {
    const result = await save.run(input)
    if (result.ok) onCreated(result.data)
  })

  return {
    form,
    errors,
    isSubmitting: form.formState.isSubmitting || save.isPending,
    showErrorSummary: submitCount > 0 && hasErrors,
    preview: errorKeys.some((key) => !NON_ATTRIBUTE_FIELDS.has(key))
      ? ({ status: 'invalid' } as const)
      : getAttributesPreview(values),
    attributesError: errors.root?.attributes?.message,
    onSubmit,
  }
}
