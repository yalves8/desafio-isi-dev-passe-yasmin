import { render, screen } from '@testing-library/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BuyButton } from './buy-button'

describe('BuyButton', () => {
  it('deve aparecer desabilitado explicando que a compra vem depois', () => {
    render(
      <TooltipProvider>
        <BuyButton />
      </TooltipProvider>,
    )

    expect(screen.getByRole('button', { name: /comprar/i })).toBeDisabled()
    expect(screen.getByLabelText('Compra disponível em breve')).toBeInTheDocument()
  })
})
