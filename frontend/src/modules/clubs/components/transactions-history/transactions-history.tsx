import { Download, History } from 'lucide-react'
import { ErrorState } from '@/components/feedback/states'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TransactionsSummary } from '../transactions-summary/transactions-summary'
import { TransactionsTable } from '../transactions-table/transactions-table'
import { useTransactionsHistory } from './transactions-history.hook'
import type { TransactionsHistoryProps } from './transactions-history.types'

/** Aba Histórico: compras e vendas do clube, com totais, filtros e CSV (RN17 e RN18) */
export function TransactionsHistory({ club, version }: TransactionsHistoryProps) {
  const { filters, history, exporting, onExport } = useTransactionsHistory({ club, version })
  const data = history.data

  return (
    <section aria-labelledby="history-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="history-title" className="text-base font-semibold">
            Histórico de transações
          </h2>
          <p className="text-xs text-muted-foreground">
            Da mais recente para a mais antiga. Valores e nomes do momento de cada operação.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={filters.type ?? 'ALL'} onValueChange={filters.onTypeChange}>
            <TabsList className="h-9 bg-muted" aria-label="Tipo de transação">
              <TabsTrigger value="ALL" className="px-2.5">
                Todas
              </TabsTrigger>
              <TabsTrigger value="COMPRA" className="px-2.5">
                Compras
              </TabsTrigger>
              <TabsTrigger value="VENDA" className="px-2.5">
                Vendas
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Select
            value={filters.playerId === undefined ? 'ALL' : String(filters.playerId)}
            onValueChange={filters.onPlayerChange}
            disabled={filters.playerOptions.length === 0}
          >
            <SelectTrigger className="h-9 w-52" aria-label="Filtrar por jogador">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os jogadores</SelectItem>
              {filters.playerOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="md" onClick={() => void onExport()} disabled={exporting}>
            <Download /> {exporting ? 'Exportando…' : 'Exportar CSV'}
          </Button>
        </div>
      </div>

      {history.error ? (
        <ErrorState message={history.error} />
      ) : !data ? (
        <div role="status" aria-label="Carregando histórico" className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <>
          <TransactionsSummary summary={data.summary} />
          {data.data.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-6 py-10 text-center">
              <History className="size-5 text-muted-foreground" aria-hidden />
              <p className="font-semibold">Nenhuma transação</p>
              <p className="max-w-md text-sm text-muted-foreground">
                {filters.hasFilters
                  ? 'Nenhuma compra ou venda atende aos filtros.'
                  : 'As compras e vendas do clube aparecem aqui assim que acontecerem.'}
              </p>
              {filters.hasFilters && (
                <Button variant="outline" size="md" onClick={filters.clear}>
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <TransactionsTable transactions={data.data} />
            </div>
          )}
        </>
      )}
    </section>
  )
}
