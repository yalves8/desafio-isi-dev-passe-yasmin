import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { playersService } from '@/api/players.service'
import { playerFixture } from '../../players.fixtures'
import { PlayerEditDialog } from './player-edit-dialog'

vi.mock('@/api/players.service', () => ({ playersService: { update: vi.fn() } }))

describe('PlayerEditDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve travar a posição de jogador com clube', () => {
    render(
      <PlayerEditDialog
        player={playerFixture({ position: 'ZAG', club_id: 2 })}
        onClose={vi.fn()}
        onUpdated={vi.fn()}
      />,
    )

    expect(screen.getByRole('radio', { name: /GOL/ })).toBeDisabled()
    expect(screen.getByRole('radio', { name: /ZAG/ })).toBeEnabled()
  })

  it('não deve enviar idade menor que a atual', async () => {
    const user = userEvent.setup()
    render(
      <PlayerEditDialog
        player={playerFixture({ age: 30 })}
        onClose={vi.fn()}
        onUpdated={vi.fn()}
      />,
    )

    await user.clear(screen.getByLabelText('Idade'))
    await user.type(screen.getByLabelText('Idade'), '29')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByText('A idade não pode diminuir (atual: 30).')).toBeInTheDocument()
    expect(playersService.update).not.toHaveBeenCalled()
  })

  it('deve enviar só os campos editáveis e devolver o jogador atualizado', async () => {
    const user = userEvent.setup()
    const updated = playerFixture({ name: 'André Lacerda Filho' })
    vi.mocked(playersService.update).mockResolvedValue(updated)
    const onUpdated = vi.fn()
    render(<PlayerEditDialog player={playerFixture()} onClose={vi.fn()} onUpdated={onUpdated} />)

    await user.type(screen.getByLabelText('Nome'), ' Filho')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(playersService.update).toHaveBeenCalledWith(1, {
      name: 'André Lacerda Filho',
      position: 'GOL',
      age: 31,
      agility: 70,
    })
    expect(onUpdated).toHaveBeenCalledWith(updated)
  })
})
