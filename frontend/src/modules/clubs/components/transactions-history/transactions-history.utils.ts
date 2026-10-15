import type { Transaction, TransactionFilters, TransactionType } from '@/api/types'

export const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'COMPRA', label: 'Compra' },
  { value: 'VENDA', label: 'Venda' },
]

/** Jogadores que aparecem no histórico, para o filtro por jogador */
export function playerOptions(transactions: Transaction[]) {
  const byId = new Map<number, string>()
  for (const t of transactions) if (!byId.has(t.player_id)) byId.set(t.player_id, t.player_name)
  return [...byId]
    .map(([id, name]) => ({ value: String(id), label: name }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

/** Marca ou desmarca um tipo; o último marcado não sai (sem tipo, nada seria listado) */
export function toggleType(selected: TransactionType[], type: TransactionType) {
  if (!selected.includes(type))
    return TRANSACTION_TYPES.map((t) => t.value).filter((t) => t === type || selected.includes(t))
  return selected.length === 1 ? selected : selected.filter((t) => t !== type)
}

/** Filtros da API: os dois tipos marcados equivalem a não filtrar por tipo */
export function toTransactionFilters(
  types: TransactionType[],
  playerId?: number,
): TransactionFilters {
  return {
    types: types.length === TRANSACTION_TYPES.length ? undefined : types,
    player_id: playerId,
  }
}

/** Nome do arquivo baixado, igual ao enviado pela API */
export function csvFileName(clubId: number) {
  return `historico-clube-${clubId}.csv`
}

/** Complemento do aviso de CSV baixado (ex.: "com o filtro de tipo Venda aplicado") */
export function exportedFiltersText(filters: TransactionFilters, playerName?: string) {
  const parts = [
    filters.types &&
      `de tipo ${filters.types.map((t) => (t === 'COMPRA' ? 'Compra' : 'Venda')).join(' e ')}`,
    filters.player_id !== undefined && playerName && `de jogador ${playerName}`,
  ].filter(Boolean)
  if (parts.length === 0) return 'com todas as transações do clube'
  if (parts.length === 1) return `com o filtro ${parts[0]} aplicado`
  return `com os filtros ${parts.join(' e ')} aplicados`
}
