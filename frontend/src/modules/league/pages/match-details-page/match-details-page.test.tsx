import { screen, within } from '@testing-library/react'
import { clubsService } from '@/api/clubs.service'
import { matchesService } from '@/api/matches.service'
import { renderPage } from '@/test/render'
import { CLUBS, matchFixture } from '../../league.fixtures'
import { MatchDetailsPage } from './match-details-page'

vi.mock('@/api/clubs.service', () => ({ clubsService: { list: vi.fn() } }))
vi.mock('@/api/matches.service', () => ({ matchesService: { get: vi.fn() } }))

describe('MatchDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clubsService.list).mockResolvedValue(CLUBS)
    vi.mocked(matchesService.get).mockResolvedValue(matchFixture())
  })

  it('deve mostrar o placar, os titulares em campo e os 6 duelos gravados (L03)', async () => {
    renderPage(<MatchDetailsPage />, { route: '/partidas/1', path: '/partidas/:id' })

    expect(await screen.findByLabelText('Placar 1 × 2')).toBeInTheDocument()
    expect(screen.getByText('Mandante · 2-1-1')).toBeInTheDocument()

    const pitch = screen.getByRole('img', { name: /Campo com os titulares/ })
    expect(within(pitch).getByText('LAT · Dri 63 · Def 56')).toBeInTheDocument()
    expect(within(pitch).getAllByLabelText('Gol no duelo')).toHaveLength(3)

    const duels = screen.getByRole('region', { name: 'Duelos' })
    expect(within(duels).getByText('Ataques do Águias FC (mandante)')).toBeInTheDocument()
    expect(within(duels).getByText('Ataques do Delta FC (visitante)')).toBeInTheDocument()
    expect(within(duels).getByText('ATA, 4º de linha · Águias FC')).toBeInTheDocument()
    expect(within(duels).getAllByText('Goleiro · Delta FC')).toHaveLength(1)
    expect(within(duels).getAllByText('Gol')).toHaveLength(3)
    expect(within(duels).getAllByText('Sem gol')).toHaveLength(3)
  })

  it('deve mostrar o erro quando a partida não existe', async () => {
    vi.mocked(matchesService.get).mockRejectedValue(new Error('Partida não encontrada'))
    renderPage(<MatchDetailsPage />, { route: '/partidas/9', path: '/partidas/:id' })

    expect(await screen.findByRole('link', { name: /Voltar para partidas/ })).toBeInTheDocument()
  })
})
