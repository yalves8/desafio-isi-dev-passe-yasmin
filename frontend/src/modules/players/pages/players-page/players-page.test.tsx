import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { clubsService } from '@/api/clubs.service'
import { playersService } from '@/api/players.service'
import type { Player } from '@/api/types'
import { renderPage } from '@/test/render'
import { playerFixture } from '../../players.fixtures'
import { PlayersPage } from './players-page'

vi.mock('@/api/players.service', () => ({
  playersService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateCondition: vi.fn(),
    delete: vi.fn(),
  },
}))
vi.mock('@/api/clubs.service', () => ({ clubsService: { list: vi.fn() } }))

const basePlayer: Player = playerFixture()
const freeSick: Player = {
  ...basePlayer,
  id: 10,
  name: 'Ícaro Mendes',
  position: 'ATA',
  condition: 'DOENTE',
  base_value: 24,
  market_value: 14.4,
  club_id: null,
}

function mockList(players: Player[], total = players.length) {
  vi.mocked(playersService.list).mockImplementation(async (filters = {}) => ({
    data: filters.limit === 1 ? [] : players,
    meta: {
      page: 1,
      limit: 10,
      total_items: filters.free ? 7 : total,
      total_pages: Math.ceil(total / 10),
    },
  }))
}

function renderPlayers(route = '/jogadores') {
  return renderPage(<PlayersPage />, { route, path: '/jogadores' })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(clubsService.list).mockResolvedValue([
    { id: 2, name: 'Delta FC', acronym: 'DEL', cash: 300, squad_value: 0, net_worth: 300 },
  ])
  mockList([basePlayer, freeSick], 23)
})

describe('PlayersPage', () => {
  it('deve listar os jogadores com valores em moedas, clube e contagem das abas', async () => {
    renderPlayers()

    const row = (await screen.findByText('André Lacerda')).closest('tr')!
    // valor base e valor de mercado
    expect(within(row).getAllByText('26,00')).toHaveLength(2)
    expect(within(row).getByRole('link', { name: 'Delta FC' })).toHaveAttribute('href', '/clubes/2')

    const freeRow = screen.getByText('Ícaro Mendes').closest('tr')!
    expect(within(freeRow).getByText('14,40')).toBeInTheDocument()
    expect(within(freeRow).getByText('Livre')).toBeInTheDocument()
    expect(within(freeRow).getByRole('button', { name: /comprar/i })).toBeDisabled()

    expect(screen.getByText('Mostrando 1–10 de 23 jogadores')).toBeInTheDocument()
    expect(await screen.findByRole('tab', { name: /todos\s*23/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /livres\s*7/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /em clubes\s*16/i })).toBeInTheDocument()
  })

  it('deve enviar os filtros da URL para a API e mostrar os chips ativos', async () => {
    renderPlayers('/jogadores?condition=MAL_CONDICIONADO&min_age=18&max_age=30&sort=value_desc')

    await screen.findByText('André Lacerda')
    expect(playersService.list).toHaveBeenCalledWith(
      expect.objectContaining({
        condition: 'MAL_CONDICIONADO',
        min_age: 18,
        max_age: 30,
        sort: 'value_desc',
        page: 1,
        limit: 10,
      }),
    )
    expect(screen.getByText('Filtros ativos:')).toBeInTheDocument()
    expect(screen.getByText('Idade: 18 a 30', { selector: 'span' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /ordenar: maior valor de mercado/i }),
    ).toBeInTheDocument()
  })

  it('deve impedir "Livres" junto com o filtro por clube', async () => {
    renderPlayers('/jogadores?club=2')

    expect(await screen.findByRole('tab', { name: /livres/i })).toBeDisabled()
    expect(playersService.list).not.toHaveBeenCalledWith(
      expect.objectContaining({ free: true, club_id: 2 }),
    )
  })

  it('deve mostrar o erro da API com opção de tentar de novo', async () => {
    vi.mocked(playersService.list).mockRejectedValue(new Error('falhou'))
    renderPlayers()

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro inesperado')
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('deve mostrar o estado vazio com ação de limpar filtros', async () => {
    mockList([])
    renderPlayers('/jogadores?search=zzz')

    expect(await screen.findByText('Nenhum jogador encontrado')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Limpar filtros' }).length).toBeGreaterThan(0)
  })

  it('deve validar o cadastro antes de enviar e mostrar os valores calculados pela API', async () => {
    const user = userEvent.setup()
    vi.mocked(playersService.create).mockResolvedValue({
      ...basePlayer,
      id: 99,
      name: 'Davi Melo',
      position: 'MEI',
      club_id: null,
      base_value: 26,
      market_value: 26,
      overall: 68,
    })
    renderPlayers()
    await screen.findByText('André Lacerda')

    await user.click(screen.getByRole('button', { name: /novo jogador/i }))
    await user.click(screen.getByRole('button', { name: 'Salvar jogador' }))

    expect(await screen.findByText('Informe o nome.')).toBeInTheDocument()
    expect(screen.getByText('Corrija os campos destacados para salvar.')).toBeInTheDocument()
    expect(playersService.create).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Nome'), 'Davi Melo')
    await user.click(screen.getByRole('radio', { name: /MEI/ }))
    const fields: [string, string][] = [
      ['Idade', '23'],
      ['Agilidade', '70'],
      ['Velocidade', '66'],
      ['Finalização', '62'],
      ['Passe', '74'],
      ['Drible', '70'],
      ['Defesa', '48'],
      ['Físico', '58'],
      ['Potencial', '82'],
    ]
    for (const [label, value] of fields) await user.type(screen.getByLabelText(label), value)
    await user.click(screen.getByRole('button', { name: 'Salvar jogador' }))

    expect(await screen.findByText('Jogador cadastrado')).toBeInTheDocument()
    expect(playersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Davi Melo', position: 'MEI', age: 23, potential: 82 }),
    )
    expect(screen.getByText(/Davi Melo entrou livre e Apto/)).toBeInTheDocument()
  })

  it('não deve deixar um jogador Doente passar direto para Apto', async () => {
    const user = userEvent.setup()
    vi.mocked(playersService.updateCondition).mockResolvedValue({
      ...freeSick,
      condition: 'MAL_CONDICIONADO',
    })
    renderPlayers()

    await user.click(await screen.findByRole('button', { name: 'Ações de Ícaro Mendes' }))
    await user.click(screen.getByRole('menuitem', { name: /alterar condição/i }))

    expect(screen.getByRole('radio', { name: /^apto/i })).toBeDisabled()
    expect(screen.getByText('De Doente não passa direto para Apto.')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /^mal condicionado/i }))
    await user.click(screen.getByRole('button', { name: 'Salvar condição' }))

    expect(playersService.updateCondition).toHaveBeenCalledWith(10, 'MAL_CONDICIONADO')
    await waitFor(() =>
      expect(screen.queryByText('Alterar condição física')).not.toBeInTheDocument(),
    )
  })

  it('deve excluir só jogador livre, com confirmação, e recarregar a lista', async () => {
    const user = userEvent.setup()
    vi.mocked(playersService.delete).mockResolvedValue()
    renderPlayers()

    await user.click(await screen.findByRole('button', { name: 'Ações de André Lacerda' }))
    expect(screen.getByRole('menuitem', { name: /excluir/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('button', { name: 'Ações de Ícaro Mendes' }))
    await user.click(screen.getByRole('menuitem', { name: /excluir/i }))
    expect(screen.getByText('Excluir Ícaro Mendes?')).toBeInTheDocument()

    const callsBefore = vi.mocked(playersService.list).mock.calls.length
    await user.click(screen.getByRole('button', { name: 'Excluir jogador' }))

    expect(playersService.delete).toHaveBeenCalledWith(10)
    await waitFor(() =>
      expect(vi.mocked(playersService.list).mock.calls.length).toBeGreaterThan(callsBefore),
    )
  })
})
