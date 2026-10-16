import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BuyButton } from './buy-button'

describe('BuyButton', () => {
  it('deve abrir a compra ao clicar', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<BuyButton playerName="Ana Lima" onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'Comprar Ana Lima' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('deve ficar desabilitado explicando o motivo', () => {
    render(
      <TooltipProvider>
        <BuyButton
          playerName="Ana Lima"
          onClick={vi.fn()}
          disabledReason="Cadastre um clube para comprar."
        />
      </TooltipProvider>,
    )

    expect(screen.getByRole('button', { name: 'Comprar Ana Lima' })).toBeDisabled()
    expect(screen.getByLabelText('Cadastre um clube para comprar.')).toBeInTheDocument()
  })
})
