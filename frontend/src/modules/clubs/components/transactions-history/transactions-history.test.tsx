import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { clubsService } from '@/api/clubs.service'
import type { Transaction } from '@/api/types'
import { clubFixture, transactionsFixture } from '../../clubs.fixtures'
import { TransactionsHistory } from './transactions-history'
import {
  csvFileName,
  exportedFiltersText,
  playerOptions,
  toggleType,
  toTransactionFilters,
} from './transactions-history.utils'

vi.mock('@/api/clubs.service', () => ({
  clubsService: { getTransactions: vi.fn(), exportTransactions: vi.fn() },
}))

const sale: Transaction = {
  id: 11,
  club_id: 1,
  player_id: 2,
  player_name: 'Meia Lua',
  type: 'VENDA',
  value: 40,
  fee: 0.3,
  penalty: 4,
  profit: 3,
  cash_change: 35.7,
  created_at: '2026-11-05T16:40:00-03:00',
}
const purchase: Transaction = {
  ...sale,
  id: 10,
  type: 'COMPRA',
  value: 37,
  fee: 1.85,
  penalty: 0,
  profit: null,
  cash_change: -38.85,
  created_at: '2026-11-02T10:15:00-03:00',
}

describe('TransactionsHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clubsService.getTransactions).mockResolvedValue(
      transactionsFixture({ data: [sale, purchase] }),
    )
  })

  it('deve listar as transações com os totais e a conta do caixa (H01)', async () => {
    render(<TransactionsHistory club={clubFixture()} version={0} />)

    expect(await screen.findAllByText('Meia Lua')).toHaveLength(2)
    expect(screen.getByRole('checkbox', { name: 'Compra' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Venda' })).toBeChecked()
    expect(screen.getByLabelText('Totais das transações filtradas')).toBeInTheDocument()
    expect(
      screen.getByText(/300,00 \+ soma das variações = caixa atual \(51,58\)/),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument()
  })

  it('deve filtrar por tipo na API e não deixar desmarcar o último tipo (H02)', async () => {
    const user = userEvent.setup()
    render(<TransactionsHistory club={clubFixture()} version={0} />)
    await screen.findAllByText('Meia Lua')

    await user.click(screen.getByRole('checkbox', { name: 'Compra' }))
    expect(clubsService.getTransactions).toHaveBeenLastCalledWith(1, {
      types: ['VENDA'],
      player_id: undefined,
    })
    expect(screen.getByRole('checkbox', { name: 'Venda' })).toHaveAttribute('aria-disabled', 'true')

    await user.click(screen.getByRole('checkbox', { name: 'Venda' }))
    expect(screen.getByRole('checkbox', { name: 'Venda' })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(screen.getByRole('checkbox', { name: 'Compra' })).toBeChecked()
  })

  it('deve mostrar o histórico vazio com os totais zerados (H04)', async () => {
    vi.mocked(clubsService.getTransactions).mockResolvedValue(transactionsFixture())
    render(<TransactionsHistory club={clubFixture()} version={0} />)

    expect(await screen.findByText('Nenhuma transação ainda')).toBeInTheDocument()
    expect(screen.getByLabelText('Totais das transações filtradas')).toBeInTheDocument()
  })

  it('deve mostrar a recusa do filtro sem tabela nem totais (H05)', async () => {
    const user = userEvent.setup()
    render(<TransactionsHistory club={clubFixture()} version={0} />)
    await screen.findAllByText('Meia Lua')

    vi.mocked(clubsService.getTransactions).mockRejectedValue(new Error('Jogador não encontrado.'))
    await user.click(screen.getByRole('checkbox', { name: 'Compra' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('O filtro foi recusado')
    expect(screen.queryByLabelText('Totais das transações filtradas')).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByText(/soma das variações/)).not.toBeInTheDocument()
  })
})

describe('transactions-history utils', () => {
  it('deve montar as opções de jogador sem repetir', () => {
    expect(playerOptions([sale, purchase])).toEqual([{ value: '2', label: 'Meia Lua' }])
  })

  it('deve tratar os dois tipos marcados como sem filtro de tipo', () => {
    expect(toTransactionFilters(['COMPRA', 'VENDA'], 2)).toEqual({ types: undefined, player_id: 2 })
    expect(toTransactionFilters(['VENDA'])).toEqual({ types: ['VENDA'], player_id: undefined })
  })

  it('deve manter pelo menos um tipo marcado, na ordem Compra e Venda', () => {
    expect(toggleType(['COMPRA', 'VENDA'], 'COMPRA')).toEqual(['VENDA'])
    expect(toggleType(['VENDA'], 'VENDA')).toEqual(['VENDA'])
    expect(toggleType(['VENDA'], 'COMPRA')).toEqual(['COMPRA', 'VENDA'])
  })

  it('deve descrever o arquivo e os filtros do CSV baixado', () => {
    expect(csvFileName(1)).toBe('historico-clube-1.csv')
    expect(exportedFiltersText({ types: ['VENDA'] })).toBe('com o filtro de tipo Venda aplicado')
    expect(exportedFiltersText({ player_id: 2 }, 'Meia Lua')).toBe(
      'com o filtro de jogador Meia Lua aplicado',
    )
    expect(exportedFiltersText({ types: ['COMPRA'], player_id: 2 }, 'Meia Lua')).toBe(
      'com os filtros de tipo Compra e de jogador Meia Lua aplicados',
    )
    expect(exportedFiltersText({})).toBe('com todas as transações do clube')
  })
})
