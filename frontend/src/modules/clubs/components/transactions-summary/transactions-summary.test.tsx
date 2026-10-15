import { render, screen } from '@testing-library/react'
import { TransactionsSummary } from './transactions-summary'

describe('TransactionsSummary', () => {
  it('deve mostrar os 5 totais da API, com o lucro sinalizado', () => {
    render(
      <TransactionsSummary
        summary={{
          total_spent: 309.96,
          total_received: 61.54,
          total_fees: 12.63,
          total_penalties: 10.46,
          total_profit: -2.7,
        }}
      />,
    )

    expect(screen.getByText('Total pago em compras').nextSibling).toHaveTextContent('309,96')
    expect(screen.getByText('Total recebido em vendas').nextSibling).toHaveTextContent('61,54')
    expect(screen.getByText('Taxas e comissões').nextSibling).toHaveTextContent('12,63')
    expect(screen.getByText('Multas').nextSibling).toHaveTextContent('10,46')
    expect(screen.getByText('−2,70')).toHaveClass('text-red-600')
  })
})
