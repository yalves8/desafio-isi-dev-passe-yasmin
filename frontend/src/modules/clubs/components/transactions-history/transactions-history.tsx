import { Check, Download, UserRound } from 'lucide-react'
import { AlertMessage } from '@/components/feedback/alert-message/alert-message'
import { ErrorState } from '@/components/feedback/states'
import { FilterSelect } from '@/components/form/filter-select/filter-select'
import { SectionCard } from '@/components/layout/section-card/section-card'
import { Button } from '@/components/ui/button'
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
  const { filters, history, clubCash, exporting, onExport, onRetry } = useTransactionsHistory({
    club,
    version,
  })
  const data = history.data

  if (history.error && !filters.hasFilters) {
    return (
      <ErrorState
        bordered
        title="Não foi possível carregar o histórico"
        message={`${history.error} Os totais e a exportação ficam indisponíveis até a lista carregar.`}
        onRetry={onRetry}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Histórico de transações"
        description="Da mais recente para a mais antiga, com o nome e os valores do momento de cada operação."
        headerClassName="border-b-0 px-4 py-3.5"
        actions={
          <Button variant="outline" size="md" onClick={() => void onExport()} disabled={exporting}>
            <Download /> {exporting ? 'Exportando…' : 'Exportar CSV'}
          </Button>
        }
      >
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
          <FilterSelect
            icon={UserRound}
            label="Filtrar por jogador"
            prefix="Jogador"
            allLabel="Todos os jogadores"
            options={filters.playerOptions}
            value={filters.playerId === undefined ? undefined : String(filters.playerId)}
            onChange={filters.onPlayerChange}
            disabled={filters.playerOptions.length === 0}
          />
          {filters.hasFilters && (
            <Button variant="link" size="md" className="px-3" onClick={filters.clear}>
              Limpar filtros
            </Button>
          )}
        </div>

        {history.error ? (
          filters.hasFilters && (
            <div className="p-4">
              <AlertMessage variant="error" title="O filtro foi recusado">
                {history.error}
              </AlertMessage>
            </div>
          )
        ) : (
          <>
            <TransactionsTable
              transactions={data?.data ?? []}
              loading={!data}
              hasFilters={filters.hasFilters}
            />
            {data && <TransactionsSummary summary={data.summary} />}
          </>
        )}
      </SectionCard>

      {data && !history.error && (
        <p className="text-xs text-muted-foreground">
          Os totais respeitam os filtros. {formatMoney(INITIAL_CASH)} + soma das variações = caixa
          atual ({formatMoney(clubCash)}).
        </p>
      )}
    </div>
  )
}
