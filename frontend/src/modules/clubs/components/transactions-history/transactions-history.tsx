import { Check, CircleAlert, Download, History, UserRound } from 'lucide-react'
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
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { INITIAL_CASH } from '../../clubs.constants'
import { TransactionsSummary } from '../transactions-summary/transactions-summary'
import { TransactionsTable } from '../transactions-table/transactions-table'
import { useTransactionsHistory } from './transactions-history.hook'
import type { TransactionsHistoryProps } from './transactions-history.types'
import { TRANSACTION_TYPES } from './transactions-history.utils'

/** Aba Histórico (Figma H01–H05): compras e vendas do clube, filtros, totais e CSV (RN17 e RN18) */
export function TransactionsHistory({ club, version }: TransactionsHistoryProps) {
  const { filters, history, clubCash, exporting, onExport } = useTransactionsHistory({
    club,
    version,
  })
  const data = history.data

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-labelledby="history-title"
        className="overflow-hidden rounded-xl border bg-card shadow-2xs"
      >
        <header className="flex flex-wrap items-start justify-between gap-3 px-4 py-3.5">
          <div>
            <h2 id="history-title" className="text-base font-semibold">
              Histórico de transações
            </h2>
            <p className="text-xs text-muted-foreground">
              Da mais recente para a mais antiga, com o nome e os valores do momento de cada
              operação.
            </p>
          </div>
          <Button variant="outline" size="md" onClick={() => void onExport()} disabled={exporting}>
            <Download /> {exporting ? 'Exportando…' : 'Exportar CSV'}
          </Button>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b px-4 pb-3">
          <span id="history-type-label" className="mr-1 text-sm font-medium text-muted-foreground">
            Tipo
          </span>
          <div role="group" aria-labelledby="history-type-label" className="flex gap-2">
            {TRANSACTION_TYPES.map(({ value, label }) => {
              const checked = filters.types.includes(value)
              const locked = filters.isTypeLocked(value)
              return (
                <button
                  key={value}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  aria-disabled={locked}
                  title={locked ? 'Pelo menos um tipo fica marcado' : undefined}
                  onClick={() => filters.onToggleType(value)}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
                    checked
                      ? 'border-primary bg-blue-50 text-blue-700'
                      : 'bg-card hover:bg-muted/60',
                    locked && 'cursor-default',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-4 items-center justify-center rounded-[4px] border',
                      checked
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-zinc-400 bg-card shadow-2xs',
                    )}
                  >
                    {checked && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  {label}
                </button>
              )
            })}
          </div>
          <span aria-hidden className="mx-1 h-5 w-px bg-border" />
          <Select
            value={filters.playerId === undefined ? 'ALL' : String(filters.playerId)}
            onValueChange={filters.onPlayerChange}
            disabled={filters.playerOptions.length === 0}
          >
            <SelectTrigger
              className="h-9 w-auto gap-2 pl-3 text-left text-muted-foreground"
              aria-label="Filtrar por jogador"
            >
              <UserRound aria-hidden />
              <SelectValue>Jogador: {filters.playerLabel}</SelectValue>
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
          {filters.hasFilters && (
            <Button variant="link" size="md" className="px-3" onClick={filters.clear}>
              Limpar filtros
            </Button>
          )}
        </div>

        {history.error ? (
          filters.hasFilters ? (
            <div className="p-4">
              <div
                role="alert"
                className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p>
                  <span className="font-medium">O filtro foi recusado</span>
                  <br />
                  {history.error}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <ErrorState message={history.error} />
            </div>
          )
        ) : !data ? (
          <div role="status" aria-label="Carregando histórico" className="flex flex-col gap-2 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            {data.data.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-muted">
                  <History className="size-5 text-muted-foreground" aria-hidden />
                </span>
                <p className="font-semibold">
                  {filters.hasFilters
                    ? 'Nenhuma transação com esses filtros'
                    : 'Nenhuma transação ainda'}
                </p>
                <p className="max-w-md text-sm text-muted-foreground">
                  {filters.hasFilters
                    ? 'Nenhuma compra ou venda do clube atende aos filtros escolhidos.'
                    : 'As compras e vendas do clube aparecem aqui, com os totais logo abaixo.'}
                </p>
              </div>
            ) : (
              <TransactionsTable transactions={data.data} />
            )}
            <TransactionsSummary summary={data.summary} />
          </>
        )}
      </section>

      {data && !history.error && (
        <p className="text-xs text-muted-foreground">
          Os totais respeitam os filtros. {formatMoney(INITIAL_CASH)} + soma das variações = caixa
          atual ({formatMoney(clubCash)}).
        </p>
      )}
    </div>
  )
}
