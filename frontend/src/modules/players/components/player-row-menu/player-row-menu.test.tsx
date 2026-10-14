import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { playerFixture } from '../../players.fixtures'
import { PlayerRowMenu } from './player-row-menu'

const actions = {
  onDetails: vi.fn(),
  onEdit: vi.fn(),
  onCondition: vi.fn(),
  onDelete: vi.fn(),
  onBuy: vi.fn(),
}

describe('PlayerRowMenu', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve chamar a ação escolhida com o jogador', async () => {
    const user = userEvent.setup()
    const player = playerFixture({ club_id: null })
    render(<PlayerRowMenu player={player} actions={actions} />)

    await user.click(screen.getByRole('button', { name: 'Ações de André Lacerda' }))
    await user.click(screen.getByRole('menuitem', { name: /editar/i }))

    expect(actions.onEdit).toHaveBeenCalledWith(player)
  })

  it('não deve permitir excluir jogador com clube', async () => {
    const user = userEvent.setup()
    render(<PlayerRowMenu player={playerFixture({ club_id: 2 })} actions={actions} />)

    await user.click(screen.getByRole('button', { name: 'Ações de André Lacerda' }))

    expect(screen.getByRole('menuitem', { name: /excluir/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByText('Só jogador livre pode ser excluído.')).toBeInTheDocument()
  })

  it('deve abrir a compra do jogador livre', async () => {
    const user = userEvent.setup()
    const player = playerFixture({ club_id: null })
    render(<PlayerRowMenu player={player} actions={actions} />)

    await user.click(screen.getByRole('button', { name: 'Ações de André Lacerda' }))
    await user.click(screen.getByRole('menuitem', { name: /comprar/i }))

    expect(actions.onBuy).toHaveBeenCalledWith(player)
  })

  it('deve desabilitar a compra explicando o motivo', async () => {
    const user = userEvent.setup()
    render(
      <PlayerRowMenu
        player={playerFixture({ club_id: null })}
        actions={{ ...actions, buyDisabledReason: 'Cadastre um clube para comprar.' }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Ações de André Lacerda' }))

    expect(screen.getByRole('menuitem', { name: /comprar/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByText('Cadastre um clube para comprar.')).toBeInTheDocument()
  })
})
