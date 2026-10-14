import { render, screen } from '@testing-library/react'
import { TransactionsSummary } from './transactions-summary'

describe('TransactionsSummary', () => {
  it('deve mostrar os 5 totais com o lucro sinalizado', () => {
    render(
      <TransactionsSummary
        summary={{
          total_spent: 38.85,
          total_received: 35.7,
          total_fees: 2.15,
          total_penalties: 4,
          total_profit: 3,
        }}
      />,
    )

    expect(screen.getByText('38,85')).toBeInTheDocument()
    expect(screen.getByText('35,70')).toBeInTheDocument()
    expect(screen.getByText('2,15')).toBeInTheDocument()
    expect(screen.getByText('4,00')).toBeInTheDocument()
    expect(screen.getByText('+3,00')).toHaveClass('text-green-700')
  })
})
