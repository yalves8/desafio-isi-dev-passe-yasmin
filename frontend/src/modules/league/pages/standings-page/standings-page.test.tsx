import { screen, within } from '@testing-library/react'
import { clubsService } from '@/api/clubs.service'
import { matchesService } from '@/api/matches.service'
import { renderPage } from '@/test/render'
import { CLUBS, matchFixture } from '../../league.fixtures'
import { StandingsPage } from './standings-page'

vi.mock('@/api/clubs.service', () => ({ clubsService: { list: vi.fn() } }))
vi.mock('@/api/matches.service', () => ({
  matchesService: { list: vi.fn(), standings: vi.fn() },
}))

const row = (position: number, club_id: number, club_name: string, extra = {}) => ({
  position,
  club_id,
  club_name,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goals_for: 0,
  goals_against: 0,
  goal_difference: 0,
  points: 0,
  ...extra,
})

describe('StandingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clubsService.list).mockResolvedValue(CLUBS)
    vi.mocked(matchesService.list).mockResolvedValue([matchFixture({ duels: undefined })])
    vi.mocked(matchesService.standings).mockResolvedValue([
      row(1, 2, 'Delta FC', {
        played: 1,
        wins: 1,
        goals_for: 2,
        goals_against: 1,
        goal_difference: 1,
        points: 3,
      }),
      row(2, 3, 'Gama SC'),
      row(3, 1, 'Águias FC', {
        played: 1,
        losses: 1,
        goals_for: 1,
        goals_against: 2,
        goal_difference: -1,
      }),
    ])
  })

  it('deve mostrar a classificação na ordem da API, com saldo sinalizado (L05)', async () => {
    renderPage(<StandingsPage />, { route: '/classificacao', path: '/classificacao' })

    const table = await screen.findByRole('region', { name: 'Classificação' })
    await within(table).findByText('Delta FC')
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows.map((r) => within(r).getByRole('link').textContent)).toEqual([
      'Delta FC',
      'Gama SC',
      'Águias FC',
    ])
    expect(within(rows[0]).getByText('+1')).toBeInTheDocument()
    expect(within(rows[2]).getByText('−1')).toBeInTheDocument()
    expect(within(rows[0]).getByRole('link')).toHaveAttribute('href', '/clubes/2')
    expect(screen.getByRole('region', { name: 'Últimas partidas' })).toHaveTextContent(
      'Águias FC1 × 2Delta FC',
    )
    expect(screen.getByText('Mais gols marcados')).toBeInTheDocument()
  })

  it('deve mostrar a liga sem clubes e o erro com tentar de novo', async () => {
    vi.mocked(matchesService.standings).mockResolvedValue([])
    const { unmount } = renderPage(<StandingsPage />, {
      route: '/classificacao',
      path: '/classificacao',
    })
    expect(await screen.findByText('Nenhum clube cadastrado')).toBeInTheDocument()
    unmount()

    vi.mocked(matchesService.standings).mockRejectedValue(new Error('falhou'))
    renderPage(<StandingsPage />, { route: '/classificacao', path: '/classificacao' })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar a classificação',
    )
  })
})
