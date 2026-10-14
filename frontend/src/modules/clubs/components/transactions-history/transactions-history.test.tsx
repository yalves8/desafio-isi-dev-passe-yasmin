import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { clubsService } from '@/api/clubs.service'
import { clubFixture, transactionsFixture } from '../../clubs.fixtures'
import { TransactionsHistory } from './transactions-history'
import { csvFileName, playerOptions } from './transactions-history.utils'

vi.mock('@/api/clubs.service', () => ({
  clubsService: { getTransactions: vi.fn(), exportTransactions: vi.fn() },
}))

const sale = {
  id: 11,
  club_id: 1,
  player_id: 2,
  player_name: 'Meia Lua',
  type: 'VENDA' as const,
  value: 40,
  fee: 0.3,
  penalty: 4,
  profit: 3,
  cash_change: 35.7,
  created_at: '2026-11-05T16:40:00-03:00',
}

describe('TransactionsHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clubsService.getTransactions).mockResolvedValue(transactionsFixture({ data: [sale] }))
  })

  it('deve listar as transações e filtrar por tipo na API', async () => {
    const user = userEvent.setup()
    render(<TransactionsHistory club={clubFixture()} version={0} />)

    expect(await screen.findByRole('cell', { name: 'Meia Lua' })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Vendas' }))

    expect(clubsService.getTransactions).toHaveBeenCalledWith(1, {
      type: 'VENDA',
      player_id: undefined,
    })
  })

  it('deve mostrar o estado vazio', async () => {
    vi.mocked(clubsService.getTransactions).mockResolvedValue(transactionsFixture())
    render(<TransactionsHistory club={clubFixture()} version={0} />)

    expect(await screen.findByText('Nenhuma transação')).toBeInTheDocument()
  })
})

describe('transactions-history utils', () => {
  it('deve montar as opções de jogador sem repetir e o nome do CSV', () => {
    expect(playerOptions([sale, { ...sale, id: 10, type: 'COMPRA' }])).toEqual([
      { value: '2', label: 'Meia Lua' },
    ])
    expect(csvFileName('AGU')).toBe('historico-agu.csv')
  })
})
