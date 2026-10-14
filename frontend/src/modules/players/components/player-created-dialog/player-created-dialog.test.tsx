import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { playerFixture } from '../../players.fixtures'
import { PlayerCreatedDialog } from './player-created-dialog'

describe('PlayerCreatedDialog', () => {
  it('deve mostrar os valores devolvidos pela API e abrir os detalhes', async () => {
    const user = userEvent.setup()
    const onDetails = vi.fn()
    render(
      <PlayerCreatedDialog
        player={playerFixture({
          name: 'Davi Melo',
          position: 'MEI',
          base_value: 26,
          market_value: 26.5,
          overall: 68,
        })}
        onClose={vi.fn()}
        onDetails={onDetails}
      />,
    )

    expect(screen.getByText(/Davi Melo entrou livre e Apto/)).toBeInTheDocument()
    expect(screen.getByText('26,50')).toBeInTheDocument()
    expect(screen.getByText('Pelos pesos da posição Meio-campo')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ver detalhes/i }))
    expect(onDetails).toHaveBeenCalledOnce()
  })
})
