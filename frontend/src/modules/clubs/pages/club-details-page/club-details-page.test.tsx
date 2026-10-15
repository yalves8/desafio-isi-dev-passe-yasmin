import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { clubsService } from '@/api/clubs.service'
import { playersService } from '@/api/players.service'
import { renderPage } from '@/test/render'
import {
  clubFixture,
  lineupFixture,
  squadPlayerFixture as player,
  transactionsFixture,
} from '../../clubs.fixtures'
import { ClubDetailsPage } from './club-details-page'
import { parseClubTab } from './club-details-page.utils'

vi.mock('@/api/clubs.service', () => ({
  clubsService: {
    get: vi.fn(),
    getLineup: vi.fn(),
    updateLineup: vi.fn(),
    getTransactions: vi.fn(),
    exportTransactions: vi.fn(),
  },
}))
vi.mock('@/api/players.service', () => ({ playersService: { sell: vi.fn() } }))

const gol = player({ id: 1, name: 'Bruno Tavares', position: 'GOL' })
const zag = player({ id: 2, name: 'Felipe Moura', position: 'ZAG' })
const lat = player({ id: 3, name: 'Diego Ramos', position: 'LAT' })
const mei = player({ id: 4, name: 'Sávio Lima', position: 'MEI' })
const ata = player({ id: 5, name: 'João Silva', position: 'ATA' })
const squad = [gol, zag, lat, mei, ata]

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

function renderDetails(route = '/clubes/1') {
  return renderPage(<ClubDetailsPage />, { route, path: '/clubes/:id' })
}

describe('ClubDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clubsService.get).mockResolvedValue(clubFixture({ players: squad }))
    vi.mocked(clubsService.getLineup).mockResolvedValue(
      lineupFixture({ formation: '2-1-1', complete: true, players: squad }),
    )
    vi.mocked(clubsService.getTransactions).mockResolvedValue(transactionsFixture())
  })

  it('deve mostrar o clube com os valores da API e o elenco', async () => {
    renderDetails()

    expect(await screen.findByRole('heading', { name: 'Águias FC' })).toBeInTheDocument()
    expect(screen.getByText('274,26')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /elenco\s*5/i })).toBeInTheDocument()
    expect(screen.getByText('Felipe Moura')).toBeInTheDocument()
  })

  it('deve vender pelo clube e mostrar o resultado devolvido pela API', async () => {
    const user = userEvent.setup()
    vi.mocked(playersService.sell).mockResolvedValue({
      id: 11,
      club_id: 1,
      player_id: 2,
      player_name: 'Felipe Moura',
      type: 'VENDA',
      value: 52,
      fee: 0,
      penalty: 5.2,
      profit: 0,
      cash_change: 46.8,
      created_at: '2026-11-12T15:00:00-03:00',
      purchase_value: 52,
      remaining_days: 144,
      penalty_rate: 10,
      contract_status: 'RESCINDIDO',
      club_cash: 98.38,
    })
    renderDetails()

    await user.click(await screen.findByRole('button', { name: 'Vender Felipe Moura' }))
    await user.click(screen.getByRole('button', { name: 'Vender jogador' }))

    expect(playersService.sell).toHaveBeenCalledWith(2)
    expect(await screen.findByText('Jogador vendido')).toBeInTheDocument()
    expect(screen.getByText('98,38')).toBeInTheDocument()
  })

  it('deve salvar a escalação com a formação e os 5 titulares', async () => {
    const user = userEvent.setup()
    vi.mocked(clubsService.updateLineup).mockResolvedValue(
      lineupFixture({ formation: '2-1-1', complete: true, players: squad }),
    )
    renderDetails('/clubes/1?aba=escalacao')

    await user.click(await screen.findByRole('button', { name: /salvar escalação/i }))

    expect(clubsService.updateLineup).toHaveBeenCalledWith(1, {
      formation: '2-1-1',
      player_ids: [1, 2, 3, 4, 5],
    })
  })

  it('deve mostrar no card a recusa da escalação e recarregar os dados', async () => {
    const user = userEvent.setup()
    vi.mocked(clubsService.updateLineup).mockRejectedValue(
      conflict('Lucas Ferraz está DOENTE e não pode ser escalado.'),
    )
    renderDetails('/clubes/1?aba=escalacao')

    await user.click(await screen.findByRole('button', { name: /salvar escalação/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Lucas Ferraz está DOENTE e não pode ser escalado.',
    )
    await waitFor(() => expect(clubsService.getLineup).toHaveBeenCalledTimes(2))
  })

  it('deve mostrar que o clube não existe quando a API responde 404 (E04)', async () => {
    const config = { headers: new AxiosHeaders() }
    vi.mocked(clubsService.get).mockRejectedValue(
      new AxiosError(
        'Not Found',
        '404',
        config,
        {},
        {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Clube não encontrado' },
          headers: {},
          config,
        },
      ),
    )
    renderDetails('/clubes/99')

    expect(await screen.findByText('Clube não encontrado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /voltar para clubes/i })).toHaveAttribute(
      'href',
      '/clubes',
    )
  })

  it('deve mostrar o erro com tentar de novo quando a API falha de outro jeito', async () => {
    vi.mocked(clubsService.get).mockRejectedValue(new Error('falhou'))
    renderDetails('/clubes/1')

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar o clube')
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /voltar para clubes/i })).toBeInTheDocument()
  })
})

describe('parseClubTab', () => {
  it('deve voltar para o elenco com aba inválida', () => {
    expect(parseClubTab('historico')).toBe('historico')
    expect(parseClubTab('xyz')).toBe('elenco')
  })
})
