import { render, screen, within } from '@testing-library/react'
import { TransactionsTable } from './transactions-table'

describe('TransactionsTable', () => {
  it('deve mostrar compra e venda como foram gravadas, com sinal e cor (H01)', () => {
    render(
      <TransactionsTable
        transactions={[
          {
            id: 11,
            club_id: 1,
            player_id: 2,
            player_name: 'Meia Lua',
            type: 'VENDA',
            value: 40,
            fee: 0.3,
            penalty: 4,
            profit: -5.7,
            cash_change: 35.7,
            created_at: '2026-11-05T16:40:00-03:00',
          },
          {
            id: 10,
            club_id: 1,
            player_id: 2,
            player_name: 'Meia Lua',
            type: 'COMPRA',
            value: 37,
            fee: 1.85,
            penalty: 0,
            profit: null,
            cash_change: -38.85,
            created_at: '2026-11-02T10:15:00-03:00',
          },
        ]}
        loading={false}
        hasFilters={false}
      />,
    )

    const [sale, buy] = screen.getAllByRole('row').slice(1)
    expect(within(sale).getByText('05/11/2026')).toBeInTheDocument()
    expect(within(sale).getByText('16:40')).toBeInTheDocument()
    expect(within(sale).getByText('Venda')).toBeInTheDocument()
    expect(within(sale).getByText('-5,70')).toHaveClass('text-red-600')
    expect(within(sale).getByText('+35,70')).toHaveClass('text-green-700')
    expect(within(buy).getByText('Compra')).toBeInTheDocument()
    expect(within(buy).getByText('-38,85')).toHaveClass('text-red-600')
    expect(within(buy).getByLabelText('sem lucro na compra')).toHaveTextContent('–')
  })

  it('deve explicar o histórico vazio conforme os filtros (H04)', () => {
    const { rerender } = render(
      <TransactionsTable transactions={[]} loading={false} hasFilters={false} />,
    )
    expect(screen.getByText('Nenhuma transação ainda')).toBeInTheDocument()

    rerender(<TransactionsTable transactions={[]} loading={false} hasFilters />)
    expect(screen.getByText('Nenhuma transação com esses filtros')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
