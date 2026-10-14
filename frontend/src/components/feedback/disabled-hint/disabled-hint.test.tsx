import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DisabledHint } from './disabled-hint'

describe('DisabledHint', () => {
  it('deve renderizar só o filho quando não há motivo', () => {
    render(
      <DisabledHint>
        <button>Comprar</button>
      </DisabledHint>,
    )

    expect(screen.getByRole('button', { name: 'Comprar' })).toBeInTheDocument()
  })

  it('deve mostrar o motivo ao focar o controle desabilitado', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider delayDuration={0}>
        <DisabledHint reason="Compra disponível em breve">
          <button disabled>Comprar</button>
        </DisabledHint>
      </TooltipProvider>,
    )

    await user.tab()

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Compra disponível em breve')
  })
})
