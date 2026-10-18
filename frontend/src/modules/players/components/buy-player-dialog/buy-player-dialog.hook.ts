import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { playersService } from '@/api/players.service'
import type { BuyPlayerInput, Club, Player, PurchaseResult } from '@/api/types'
import { useInlineAction } from '@/hooks/use-inline-action'
import {
  buildBuyPlayerSchema,
  defaultLoyaltyUntil,
  loyaltyDateRange,
  type BuyPlayerFormInput,
} from '../../player-buy.validation'

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
  // Sugestão e datas do calendário calculadas uma vez, ao abrir o diálogo
  const [{ defaultLoyalty, dateRange }] = useState(() => {
    const now = new Date()
    return { defaultLoyalty: defaultLoyaltyUntil(now), dateRange: loyaltyDateRange(now) }
  })
  const form = useForm<BuyPlayerFormInput, unknown, BuyPlayerInput>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { clubId: '', ...defaultLoyalty },
  })
  const clubId = useWatch({ control: form.control, name: 'clubId' })
  const club = clubs.find((c) => String(c.id) === clubId)

  // Caixa, elenco cheio e recompra só a API decide (RN12 a RN14): a recusa fica no diálogo
  // Sem status, a resposta não chegou: a compra pode ser enviada de novo (`kind: 'network'`)
  const buy = useInlineAction((input: BuyPlayerInput) => playersService.buy(player.id, input), {
    errorTitle: 'Compra recusada',
    networkMessage: NETWORK_MESSAGE,
  })

  const onSubmit = form.handleSubmit(async (input) => {
    const result = await buy.run(input)
    if (result.ok) onBought(result.data)
  })

  return {
    form,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting || buy.isPending,
    club,
    dateRange,
    error: buy.error,
    onSubmit,
  }
}
