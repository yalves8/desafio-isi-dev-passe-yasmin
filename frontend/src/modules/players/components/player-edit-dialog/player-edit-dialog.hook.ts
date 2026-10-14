import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { playersService } from '@/api/players.service'
import type { Player, UpdatePlayerInput } from '@/api/types'
import { useAction } from '@/hooks/use-action'
import { buildEditPlayerSchema, type EditPlayerFormInput } from '../../player-form.validation'

export function usePlayerEditDialog({
  player,
  onUpdated,
}: {
  player: Player
  onUpdated: (player: Player) => void
}) {
  const schema = useMemo(() => buildEditPlayerSchema(player.age), [player.age])
  const form = useForm<EditPlayerFormInput, unknown, UpdatePlayerInput>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      name: player.name,
      position: player.position,
      age: String(player.age),
      agility: String(player.agility),
    },
  })
  const save = useAction((input: UpdatePlayerInput) => playersService.update(player.id, input), {
    errorTitle: 'Não foi possível salvar',
  })

  const onSubmit = form.handleSubmit(async (input) => {
    const result = await save.run(input)
    if (result.ok) onUpdated(result.data)
  })

  return {
    form,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting || save.isPending,
    // Jogador com clube não muda de posição (a API recusa com 409)
    lockedPosition: player.club_id === null ? undefined : player.position,
    onSubmit,
  }
}
