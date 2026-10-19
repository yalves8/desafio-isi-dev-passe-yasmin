import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { clubsService } from '@/api/clubs.service'
import { lineupFixture } from '@/modules/clubs/clubs.fixtures'
import { playerFixture } from '../../players.fixtures'
import { PlayerConditionDialog } from './player-condition-dialog'
import { isConditionBlocked } from './player-condition-dialog.utils'

vi.mock('@/api/clubs.service', () => ({ clubsService: { getLineup: vi.fn() } }))

const club = { id: 1, name: 'Águias FC', acronym: 'AGU', cash: 0, squad_value: 0, net_worth: 0 }

describe('PlayerConditionDialog', () => {
  beforeEach(() => {
    vi.mocked(clubsService.getLineup).mockResolvedValue(lineupFixture())
  })

  it('não deve deixar Doente passar direto para Apto', () => {
    render(
      <PlayerConditionDialog
        player={playerFixture({ condition: 'DOENTE' })}
        isSubmitting={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    const apto = screen.getByRole('radio', { name: 'Apto' })
    expect(apto).toBeDisabled()
    expect(apto).toHaveAccessibleDescription(/De Doente não passa direto para Apto\.$/)
    expect(screen.getByRole('radio', { name: 'Doente' })).toHaveAccessibleDescription(/^Atual\./)
  })

  it('deve confirmar a condição escolhida e avisar que o titular sai da escalação', async () => {
    const titular = playerFixture({ name: 'Felipe Moura', club_id: 1 })
    vi.mocked(clubsService.getLineup).mockResolvedValue(
      lineupFixture({ formation: '2-1-1', players: [titular] }),
    )
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <PlayerConditionDialog
        player={playerFixture({ name: 'Felipe Moura', club_id: 1 })}
        club={club}
        isSubmitting={false}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByRole('button', { name: 'Salvar condição' })).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: 'Doente' }))

    expect(await screen.findByRole('note')).toHaveTextContent('Felipe Moura é titular')
    expect(screen.getByRole('note')).toHaveTextContent('o Águias FC só volta a jogar')
    await user.click(screen.getByRole('button', { name: 'Salvar condição' }))
    expect(onConfirm).toHaveBeenCalledWith('DOENTE')
  })

  it('não deve avisar quando o jogador do clube não é titular', async () => {
    vi.mocked(clubsService.getLineup).mockResolvedValue(lineupFixture({ formation: '2-1-1' }))
    const user = userEvent.setup()
    render(
      <PlayerConditionDialog
        player={playerFixture({ name: 'Felipe Moura', club_id: 1 })}
        club={club}
        isSubmitting={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: 'Doente' }))

    expect(clubsService.getLineup).toHaveBeenCalledWith(1)
    expect(screen.queryByRole('note')).toBeNull()
  })

  it('deve travar o envio enquanto salva', () => {
    render(
      <PlayerConditionDialog
        player={playerFixture()}
        isSubmitting
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled()
  })
})

describe('isConditionBlocked', () => {
  it('deve bloquear só de Doente para Apto', () => {
    expect(isConditionBlocked('DOENTE', 'APTO')).toBe(true)
    expect(isConditionBlocked('DOENTE', 'MAL_CONDICIONADO')).toBe(false)
    expect(isConditionBlocked('MAL_CONDICIONADO', 'APTO')).toBe(false)
  })
})
