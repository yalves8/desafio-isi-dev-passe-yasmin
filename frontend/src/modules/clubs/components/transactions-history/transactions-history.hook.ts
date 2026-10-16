import { useState } from 'react'
import { useLeagueData } from '@/hooks/use-league-data'
import { toast } from 'sonner'
import { clubsService } from '@/api/clubs.service'
import type { Club, TransactionType } from '@/api/types'
import { useAction } from '@/hooks/use-action'
import { useFetch } from '@/hooks/use-fetch'
import {
  csvFileName,
  exportedFiltersText,
  playerOptions,
  toggleType,
  toTransactionFilters,
  TRANSACTION_TYPES,
} from './transactions-history.utils'

const ALL_TYPES = TRANSACTION_TYPES.map((t) => t.value)

export function useTransactionsHistory({ club, version }: { club: Club; version: number }) {
  const { refresh } = useLeagueData()
  const [types, setTypes] = useState<TransactionType[]>(ALL_TYPES)
  const [playerId, setPlayerId] = useState<number>()
  const filters = toTransactionFilters(types, playerId)
  const hasFilters = filters.types !== undefined || playerId !== undefined

  const history = useFetch(
    `transactions:${club.id}:${JSON.stringify(filters)}:${version}`,
    () => clubsService.getTransactions(club.id, filters),
    { keepPreviousData: true },
  )
  // Sem filtro: base das opções de jogador (inclui quem já foi vendido)
  const all = useFetch(`transactions-all:${club.id}:${version}`, () =>
    clubsService.getTransactions(club.id),
  )
  const options = playerOptions(all.data?.data ?? [])
  const playerName = options.find((o) => o.value === String(playerId))?.label

  // O CSV usa os mesmos filtros da tela (RN18)
  const exportCsv = useAction(() => clubsService.exportTransactions(club.id, filters), {
    errorTitle: 'Não foi possível exportar o histórico',
  })

  const clear = () => {
    setTypes(ALL_TYPES)
    setPlayerId(undefined)
  }

  return {
    filters: {
      types,
      onToggleType: (type: TransactionType) => setTypes((current) => toggleType(current, type)),
      /** O último tipo marcado não pode ser desmarcado */
      isTypeLocked: (type: TransactionType) => types.length === 1 && types[0] === type,
      playerId,
      playerOptions: options,
      onPlayerChange: (value?: string) =>
        setPlayerId(value === undefined ? undefined : Number(value)),
      hasFilters,
      clear,
    },
    history: {
      data: history.data,
      loading: history.loading,
      error: history.error,
    },
    clubCash: club.cash,
    onRetry: refresh,
    exporting: exportCsv.isPending,
    onExport: async () => {
      const result = await exportCsv.run()
      if (!result.ok) return
      const fileName = csvFileName(club.id)
      const url = URL.createObjectURL(result.data)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
      toast.success('CSV baixado', {
        description: `${fileName}, ${exportedFiltersText(filters, playerName)}.`,
      })
    },
  }
}
