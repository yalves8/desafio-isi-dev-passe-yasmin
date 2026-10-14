import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/components/ui/tooltip'
import { playerFixture } from '../../players.fixtures'
import { PlayerDetailsSheet } from './player-details-sheet'

describe('PlayerDetailsSheet', () => {
  it('deve mostrar valores, indicadores e ações do jogador livre', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <TooltipProvider>
        <PlayerDetailsSheet
          player={playerFixture({
            name: 'Eduardo Paiva',
            club_id: null,
            market_value: 46,
            potential: 86,
          })}
          onClose={vi.fn()}
          onEdit={onEdit}
          onCondition={vi.fn()}
        />
      </TooltipProvider>,
    )

    expect(screen.getByRole('dialog', { name: 'Eduardo Paiva' })).toBeInTheDocument()
    expect(screen.getByText('46,00')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
    expect(screen.getByText('Até o potencial (86), que nenhum atributo passa')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comprar/i })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledOnce()
  })
})
