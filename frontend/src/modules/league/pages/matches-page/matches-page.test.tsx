import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { clubsService } from '@/api/clubs.service'
import { matchesService } from '@/api/matches.service'
import { renderPage } from '@/test/render'
import { CLUBS, matchFixture } from '../../league.fixtures'
import { MatchesPage } from './matches-page'

vi.mock('@/api/clubs.service', () => ({ clubsService: { list: vi.fn() } }))
vi.mock('@/api/matches.service', () => ({ matchesService: { list: vi.fn(), play: vi.fn() } }))

const LATEST = matchFixture({
  id: 2,
  played_at: '2026-11-11T20:00:00-03:00',
  home: { club_id: 2, club_name: 'Delta FC', formation: '2-1-1', goals: 2 },
  away: { club_id: 1, club_name: 'Águias FC', formation: '2-1-1', goals: 1 },
  result: 'MANDANTE',
  duels: undefined,
})

describe('MatchesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clubsService.list).mockResolvedValue(CLUBS)
    vi.mocked(matchesService.list).mockResolvedValue([LATEST, matchFixture({ duels: undefined })])
  })

  it('deve mostrar a última partida e o histórico com placar e resultado (L01)', async () => {
    renderPage(<MatchesPage />, { route: '/partidas', path: '/partidas' })

    const latest = await screen.findByRole('region', { name: 'Última partida' })
    expect(within(latest).getByLabelText('Placar 2 × 1')).toBeInTheDocument()
    expect(within(latest).getByText('Vitória do mandante')).toBeInTheDocument()

    const table = screen.getByRole('region', { name: 'Histórico de partidas' })
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getByText('11/11/2026')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Delta FC')).toHaveClass('font-semibold')
    expect(within(rows[1]).getByText('Vitória do visitante')).toBeInTheDocument()
    expect(within(table).getByText('2 partidas')).toBeInTheDocument()
  })

  it('deve filtrar o histórico por clube na API', async () => {
    const user = userEvent.setup()
    renderPage(<MatchesPage />, { route: '/partidas', path: '/partidas' })

    await user.click(await screen.findByRole('combobox', { name: 'Filtrar por clube' }))
    await user.click(await screen.findByRole('option', { name: 'Gama SC' }))

    expect(matchesService.list).toHaveBeenLastCalledWith(3)
  })

  it('deve mostrar o estado vazio sem partidas', async () => {
    vi.mocked(matchesService.list).mockResolvedValue([])
    renderPage(<MatchesPage />, { route: '/partidas', path: '/partidas' })

    expect(await screen.findByText('Nenhuma partida ainda')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Última partida' })).not.toBeInTheDocument()
  })

  it('deve abrir a nova partida pela URL (?nova=1)', async () => {
    renderPage(<MatchesPage />, { route: '/partidas?nova=1', path: '/partidas' })
    expect(await screen.findByRole('dialog', { name: 'Nova partida' })).toBeInTheDocument()
  })
})
