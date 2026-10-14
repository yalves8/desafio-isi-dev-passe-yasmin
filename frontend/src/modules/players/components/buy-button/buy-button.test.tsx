import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BuyButton } from './buy-button'

describe('BuyButton', () => {
  it('deve abrir a compra ao clicar', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<BuyButton onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'Comprar' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('deve ficar desabilitado explicando o motivo', () => {
    render(
      <TooltipProvider>
        <BuyButton onClick={vi.fn()} disabledReason="Cadastre um clube para comprar." />
      </TooltipProvider>,
    )

    expect(screen.getByRole('button', { name: 'Comprar' })).toBeDisabled()
    expect(screen.getByLabelText('Cadastre um clube para comprar.')).toBeInTheDocument()
  })
})
