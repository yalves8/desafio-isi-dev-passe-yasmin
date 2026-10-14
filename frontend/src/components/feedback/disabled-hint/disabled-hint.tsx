import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { DisabledHintProps } from './disabled-hint.types'

/**
 * Explica por que um controle está desabilitado. O span recebe o foco e o ponteiro,
 * já que elemento desabilitado não dispara eventos.
 */
export function DisabledHint({ reason, children, className }: DisabledHintProps) {
  if (!reason) return children
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} aria-label={reason} className={cn('inline-flex', className)}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  )
}
