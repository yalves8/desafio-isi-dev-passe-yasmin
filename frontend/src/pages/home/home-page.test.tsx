import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderPage } from '@/test/render'
import { HomePage } from './home-page'

vi.mock('@/api/league.service', () => ({
  leagueService: {
    getStats: vi.fn().mockResolvedValue({
      totalPlayers: 23,
      freePlayers: 7,
      totalClubs: 6,
      totalMatches: 2,
      leader: { name: 'Delta FC', points: 6 },
    }),
  },
}))

describe('HomePage', () => {
  it('deve renderizar a tela inicial com a marca Passe e a proposta de valor', async () => {
    renderPage(<HomePage />)

    expect(await screen.findByText('Passe')).toBeInTheDocument()
    expect(screen.getByText('Gestão da liga, do mercado à classificação')).toBeInTheDocument()
    expect(
      screen.getByText(/Cadastre jogadores, monte os clubes e negocie com contrato de fidelidade/),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar/i })).toBeInTheDocument()
    expect(screen.getByText(/não precisa de login/i)).toBeInTheDocument()
  })

  it('deve renderizar as 6 etapas do sistema', async () => {
    renderPage(<HomePage />)

    expect(await screen.findByText('Jogadores')).toBeInTheDocument()
    expect(screen.getByText('Clubes')).toBeInTheDocument()
    expect(screen.getByText('Compra')).toBeInTheDocument()
    expect(screen.getByText('Venda')).toBeInTheDocument()
    expect(screen.getByText('Histórico')).toBeInTheDocument()
    expect(screen.getByText('Liga')).toBeInTheDocument()
  })

  it('deve navegar para /jogadores ao clicar no botão Iniciar', async () => {
    renderPage(<HomePage />)

    const button = await screen.findByRole('button', { name: /iniciar/i })
    await userEvent.click(button)

    expect(await screen.findByText('tela de jogadores')).toBeInTheDocument()
  })

  it('deve navegar para /jogadores ao pressionar a tecla Enter', async () => {
    renderPage(<HomePage />)

    await screen.findByText('Passe')
    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' })

    expect(await screen.findByText('tela de jogadores')).toBeInTheDocument()
  })

  it('deve exibir "nenhuma partida ainda" quando a liga não possuir partidas ou líder', async () => {
    const { leagueService } = await import('@/api/league.service')
    vi.mocked(leagueService.getStats).mockResolvedValueOnce({
      totalPlayers: 23,
      freePlayers: 7,
      totalClubs: 6,
      totalMatches: 0,
      leader: null,
    })

    renderPage(<HomePage />)

    expect(await screen.findByText('nenhuma partida ainda')).toBeInTheDocument()
  })
})
