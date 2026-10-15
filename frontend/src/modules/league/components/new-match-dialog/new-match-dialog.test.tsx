import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { matchesService } from '@/api/matches.service'
import { CLUBS, matchFixture } from '../../league.fixtures'
import { NewMatchDialog } from './new-match-dialog'
import { refusedSide, validateClubs } from './new-match-dialog.utils'

vi.mock('@/api/matches.service', () => ({ matchesService: { play: vi.fn() } }))

function conflict(message: string) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError(
    'Conflict',
    '409',
    config,
    {},
    {
      status: 409,
      statusText: 'Conflict',
      data: { message },
      headers: {},
      config,
    },
  )
}

async function choose(user: ReturnType<typeof userEvent.setup>, label: string, club: RegExp) {
  await user.click(screen.getByRole('combobox', { name: label }))
  await user.click(await screen.findByRole('option', { name: club }))
}

describe('NewMatchDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve jogar com mandante e visitante e devolver a partida da API (L02)', async () => {
    const user = userEvent.setup()
    const onPlayed = vi.fn()
    vi.mocked(matchesService.play).mockResolvedValue(matchFixture())
    render(<NewMatchDialog clubs={CLUBS} onClose={vi.fn()} onPlayed={onPlayed} />)

    await choose(user, 'Mandante', /Delta FC \(DEL\)/)
    await choose(user, 'Visitante', /Águias FC \(AGU\)/)
    await user.click(screen.getByRole('button', { name: 'Jogar partida' }))

    expect(matchesService.play).toHaveBeenCalledWith({ home_club_id: 2, away_club_id: 1 })
    expect(onPlayed).toHaveBeenCalledWith(matchFixture())
  })

  it('deve exigir os dois clubes, diferentes, antes de enviar', async () => {
    const user = userEvent.setup()
    render(<NewMatchDialog clubs={CLUBS} onClose={vi.fn()} onPlayed={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Jogar partida' }))
    expect(screen.getByText('Escolha o mandante.')).toBeInTheDocument()
    expect(screen.getByText('Escolha o visitante.')).toBeInTheDocument()

    await choose(user, 'Mandante', /Delta FC/)
    await choose(user, 'Visitante', /Delta FC/)
    expect(screen.getByText('O visitante precisa ser diferente do mandante.')).toBeInTheDocument()
    expect(matchesService.play).not.toHaveBeenCalled()
  })

  it('deve mostrar a recusa da API e marcar o clube citado (L04)', async () => {
    const user = userEvent.setup()
    vi.mocked(matchesService.play).mockRejectedValue(
      conflict('Escalação incompleta: o Gama SC não tem os 5 titulares.'),
    )
    render(<NewMatchDialog clubs={CLUBS} onClose={vi.fn()} onPlayed={vi.fn()} />)

    await choose(user, 'Mandante', /Gama SC/)
    await choose(user, 'Visitante', /Águias FC/)
    await user.click(screen.getByRole('button', { name: 'Jogar partida' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível jogar a partidaEscalação incompleta: o Gama SC não tem os 5 titulares.',
    )
    expect(screen.getByRole('combobox', { name: 'Mandante' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByRole('combobox', { name: 'Visitante' })).toHaveAttribute(
      'aria-invalid',
      'false',
    )
  })

  it('deve validar e achar o lado citado na recusa', () => {
    expect(validateClubs(1, 1)).toEqual({ away: 'O visitante precisa ser diferente do mandante.' })
    expect(refusedSide('o Delta FC não tem', CLUBS[0], CLUBS[1])).toBe('away')
    expect(refusedSide(undefined, CLUBS[0], CLUBS[1])).toBeUndefined()
  })
})
