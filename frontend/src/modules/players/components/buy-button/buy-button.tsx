import { ShoppingCart } from 'lucide-react'
import { DisabledHint } from '@/components/feedback/disabled-hint/disabled-hint'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BuyButtonProps } from './buy-button.types'

/** "Comprar" de jogador livre; com motivo, fica desabilitado e explica por quê */
export function BuyButton({ onClick, disabledReason, size = 'md', className }: BuyButtonProps) {
  return (
    <DisabledHint reason={disabledReason} className={className}>
      <Button
        variant="outline"
        size={size}
        disabled={!!disabledReason}
        onClick={onClick}
        className={cn('px-3', !disabledReason && className)}
      >
        <ShoppingCart />
        Comprar
      </Button>
    </DisabledHint>
  )
}
