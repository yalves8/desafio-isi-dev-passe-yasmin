import { useState } from 'react'
import { toast } from 'sonner'
import { clubsService } from '@/api/clubs.service'
import type { Club, TransactionFilters, TransactionType } from '@/api/types'
import { useAction } from '@/hooks/use-action'
import { useFetch } from '@/hooks/use-fetch'
import { csvFileName, playerOptions } from './transactions-history.utils'

export function useTransactionsHistory({ club, version }: { club: Club; version: number }) {
  const [type, setType] = useState<TransactionType>()
  const [playerId, setPlayerId] = useState<number>()
  const filters: TransactionFilters = { type, player_id: playerId }

  const history = useFetch(
    `transactions:${club.id}:${JSON.stringify(filters)}:${version}`,
    () => clubsService.getTransactions(club.id, filters),
    { keepPreviousData: true },
  )
  // Sem filtro: base das opções de jogador
  const all = useFetch(`transactions-all:${club.id}:${version}`, () =>
    clubsService.getTransactions(club.id),
  )

  const exportCsv = useAction(() => clubsService.exportTransactions(club.id, filters), {
    errorTitle: 'Não foi possível exportar o histórico',
  })

  return {
    filters: {
      type,
      onTypeChange: (value: string) =>
        setType(value === 'ALL' ? undefined : (value as TransactionType)),
      playerId,
      onPlayerChange: (value: string) => setPlayerId(value === 'ALL' ? undefined : Number(value)),
      playerOptions: playerOptions(all.data?.data ?? []),
      hasFilters: type !== undefined || playerId !== undefined,
      clear: () => {
        setType(undefined)
        setPlayerId(undefined)
      },
    },
    history: {
      data: history.data,
      loading: history.loading,
      error: history.error,
    },
    exporting: exportCsv.isPending,
    onExport: async () => {
      const result = await exportCsv.run()
      if (!result.ok) return
      const url = URL.createObjectURL(result.data)
      const link = document.createElement('a')
      link.href = url
      link.download = csvFileName(club.acronym)
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Histórico exportado', {
        description: `${link.download} com os filtros atuais.`,
      })
    },
  }
}
