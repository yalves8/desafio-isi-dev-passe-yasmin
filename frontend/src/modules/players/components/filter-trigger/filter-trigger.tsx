import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FilterTriggerProps } from './filter-trigger.types'

/** Botão de filtro da barra: ícone, rótulo (ou valor ativo) e seta */
export function FilterTrigger({
  icon: Icon,
  label,
  active,
  className,
  ...props
}: FilterTriggerProps) {
  return (
    <Button
      variant="outline"
      size="md"
      className={cn(
        'shrink-0 gap-2 px-3 font-normal text-muted-foreground',
        active && 'text-foreground',
        className,
      )}
      {...props}
    >
      <Icon className="size-4" />
      {label}
      <ChevronDown className="size-4" />
    </Button>
  )
}
