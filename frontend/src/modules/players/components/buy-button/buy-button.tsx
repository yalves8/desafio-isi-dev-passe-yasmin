import { ShoppingCart } from 'lucide-react'
import { DisabledHint } from '@/components/feedback/disabled-hint/disabled-hint'
import { Button } from '@/components/ui/button'
import type { BuyButtonProps } from './buy-button.types'

export const BUY_DISABLED_REASON = 'Compra disponível em breve'

/** A compra entra em outra entrega: o botão aparece como no Figma, desabilitado */
export function BuyButton({ size = 'md', className }: BuyButtonProps) {
  return (
    <DisabledHint reason={BUY_DISABLED_REASON} className={className}>
      <Button variant="outline" size={size} disabled className="px-3">
        <ShoppingCart />
        Comprar
      </Button>
    </DisabledHint>
  )
}
