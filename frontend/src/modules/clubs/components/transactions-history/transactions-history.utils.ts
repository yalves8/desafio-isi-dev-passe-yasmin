import type { Transaction } from '@/api/types'

/** Jogadores que aparecem no histórico, para o filtro por jogador */
export function playerOptions(transactions: Transaction[]) {
  const byId = new Map<number, string>()
  for (const t of transactions) if (!byId.has(t.player_id)) byId.set(t.player_id, t.player_name)
  return [...byId]
    .map(([id, name]) => ({ value: String(id), label: name }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

/** Nome do arquivo do CSV: historico-agu.csv */
export function csvFileName(acronym: string) {
  return `historico-${acronym.toLowerCase()}.csv`
}
