import { render, screen } from '@testing-library/react'
import { SaleResultDialog } from './sale-result-dialog'

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
  purchase_value: 37,
  remaining_days: 117,
  penalty_rate: 10,
  contract_status: 'RESCINDIDO' as const,
  club_cash: 296.85,
}

describe('SaleResultDialog', () => {
  it('deve mostrar multa, lucro, comissão, crédito e novo caixa devolvidos pela API', () => {
    render(<SaleResultDialog sale={sale} onClose={vi.fn()} />)

    expect(screen.getByText(/Meia Lua ficou livre. Contrato rescindido/)).toBeInTheDocument()
    expect(screen.getByText('10% com 117 dias restantes')).toBeInTheDocument()
    expect(screen.getByText('+3,00')).toBeInTheDocument()
    expect(screen.getByText('0,30')).toBeInTheDocument()
    expect(screen.getByText('+35,70')).toBeInTheDocument()
    expect(screen.getByText('296,85')).toBeInTheDocument()
  })
})
