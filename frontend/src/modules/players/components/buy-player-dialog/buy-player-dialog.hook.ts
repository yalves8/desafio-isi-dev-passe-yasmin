import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { playersService } from '@/api/players.service'
import type { BuyPlayerInput, Club, Player, PurchaseResult } from '@/api/types'
import { useAction } from '@/hooks/use-action'
import {
  buildBuyPlayerSchema,
  defaultLoyaltyUntil,
  type BuyPlayerFormInput,
} from '../../player-buy.validation'
import type { BuyError } from './buy-player-dialog.types'

const NETWORK_MESSAGE = 'A compra não foi confirmada. Verifique a conexão e tente de novo.'

export function useBuyPlayerDialog({
  player,
  clubs,
  onBought,
}: {
  player: Player
  clubs: Club[]
  onBought: (purchase: PurchaseResult) => void
}) {
  const schema = useMemo(() => buildBuyPlayerSchema(), [])
  // Sugestão de fidelidade calculada uma vez, ao abrir o diálogo
  const [defaultLoyalty] = useState(() => defaultLoyaltyUntil(new Date()))
  const form = useForm<BuyPlayerFormInput, unknown, BuyPlayerInput>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { clubId: '', ...defaultLoyalty },
  })
  const clubId = useWatch({ control: form.control, name: 'clubId' })
  const club = clubs.find((c) => String(c.id) === clubId)

  // Caixa, elenco cheio e recompra só a API decide (RN12 a RN14): a recusa fica no diálogo
  const [error, setError] = useState<BuyError>()
  const buy = useAction((input: BuyPlayerInput) => playersService.buy(player.id, input), {
    errorTitle: 'Compra recusada',
    toastOnError: false,
  })

  const onSubmit = form.handleSubmit(async (input) => {
    setError(undefined)
    const result = await buy.run(input)
    if (result.ok) onBought(result.data)
    // Sem status, a resposta não chegou: a compra pode ser enviada de novo
    else if (result.status === undefined) setError({ kind: 'network', message: NETWORK_MESSAGE })
    else setError({ kind: 'refused', message: result.error ?? '' })
  })

  return {
    form,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting || buy.isPending,
    club,
    error,
    onSubmit,
  }
}
