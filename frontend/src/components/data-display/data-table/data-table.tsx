import { Fragment } from 'react'
import { EmptyState, ErrorState } from '@/components/feedback/states'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { DataTableProps } from './data-table.types'

/**
 * Tabela das telas: cabeçalho, linhas e os estados de carregando (esqueleto), vazio e erro.
 * Cada tela informa só as colunas, como desenhar uma linha e os textos de cada estado.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  renderRow,
  loading = false,
  loadingLabel,
  skeletonRows = 4,
  renderSkeletonRow,
  error,
  errorTitle,
  onRetry,
  empty,
  toolbar,
  footer,
  skeletonRowClassName = 'h-14',
  headerCellClassName,
}: DataTableProps<T>) {
  if (error) return <ErrorState title={errorTitle} message={error} onRetry={onRetry} />

  const showSkeleton = loading && rows.length === 0
  if (!showSkeleton && rows.length === 0) {
    return (
      <EmptyState
        icon={empty.icon}
        title={empty.title}
        description={empty.description}
        action={empty.action}
      />
    )
  }

  return (
    <>
      {toolbar}
      <div
        role={showSkeleton && loadingLabel ? 'status' : undefined}
        aria-label={showSkeleton ? loadingLabel : undefined}
      >
        <Table aria-busy={loading}>
          <TableHeader className="bg-muted/60">
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key ?? col.label}
                  title={col.title}
                  className={cn(
                    'h-10 px-2 font-medium text-muted-foreground first:pl-4 last:pr-4',
                    col.numeric && 'text-right',
                    headerCellClassName,
                    col.className,
                  )}
                >
                  {col.srOnly ? <span className="sr-only">{col.label}</span> : col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className={cn(loading && !showSkeleton && 'opacity-60 transition-opacity')}>
            {showSkeleton
              ? Array.from({ length: skeletonRows }, (_, i) =>
                  renderSkeletonRow ? (
                    <Fragment key={i}>{renderSkeletonRow(i)}</Fragment>
                  ) : (
                    <TableRow key={i} className={skeletonRowClassName} aria-hidden>
                      <TableCell colSpan={columns.length} className="px-4">
                        <Skeleton className="h-7 w-full" />
                      </TableCell>
                    </TableRow>
                  ),
                )
              : rows.map((row) => <Fragment key={rowKey(row)}>{renderRow(row)}</Fragment>)}
          </TableBody>
        </Table>
      </div>
      {!showSkeleton && footer}
    </>
  )
}
