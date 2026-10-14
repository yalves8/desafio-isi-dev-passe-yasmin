import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PlayersPaginationProps } from './players-pagination.types'

export function PlayersPagination({
  page,
  totalPages,
  pages,
  summary,
  onChange,
}: PlayersPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">{summary}</p>
      <nav aria-label="Paginação" className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="md"
          className="px-3 text-muted-foreground"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft /> Anterior
        </Button>
        {pages.map((n) => (
          <Button
            key={n}
            variant={n === page ? 'outline' : 'ghost'}
            size="icon-lg"
            aria-current={n === page ? 'page' : undefined}
            aria-label={`Página ${n}`}
            onClick={() => onChange(n)}
          >
            {n}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="md"
          className="px-3"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Próxima <ChevronRight />
        </Button>
      </nav>
    </div>
  )
}
