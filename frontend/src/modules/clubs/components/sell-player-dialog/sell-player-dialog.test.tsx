import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { squadPlayerFixture } from '../../clubs.fixtures'
import { SellPlayerDialog } from './sell-player-dialog'

describe('SellPlayerDialog', () => {
  it('deve mostrar o contrato e confirmar a venda', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <SellPlayerDialog
        player={squadPlayerFixture({ market_value: 40 })}
        clubName="Águias FC"
        isSelling={false}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByRole('alertdialog', { name: 'Vender Bruno Tavares?' })).toBeInTheDocument()
    expect(screen.getByText('40,00')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Vender jogador' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('deve travar enquanto vende', () => {
    render(
      <SellPlayerDialog
        player={squadPlayerFixture()}
        clubName="Águias FC"
        isSelling
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Vendendo…' })).toBeDisabled()
  })
})
