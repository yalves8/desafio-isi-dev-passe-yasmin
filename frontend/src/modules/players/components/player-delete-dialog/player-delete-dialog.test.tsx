import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { playerFixture } from '../../players.fixtures'
import { PlayerDeleteDialog } from './player-delete-dialog'

describe('PlayerDeleteDialog', () => {
  it('deve pedir confirmação e chamar onConfirm', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <PlayerDeleteDialog
        player={playerFixture({ name: 'Ícaro Mendes', club_id: null })}
        isDeleting={false}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByRole('alertdialog', { name: 'Excluir Ícaro Mendes?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Excluir jogador' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('deve travar os botões enquanto exclui', () => {
    render(
      <PlayerDeleteDialog
        player={playerFixture({ club_id: null })}
        isDeleting
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Excluindo…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })
})
