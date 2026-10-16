import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SaleResult } from '@/api/types'
import { SaleResultDialog } from './sale-result-dialog'

const sale: SaleResult = {
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
  purchase_value: 37,
  remaining_days: 117,
  penalty_rate: 10,
  contract_status: 'RESCINDIDO',
  club_cash: 296.85,
}

function renderDialog(overrides: Partial<SaleResult> = {}, wasStarter = false) {
  const onViewHistory = vi.fn()
  render(
    <SaleResultDialog
      sale={{ ...sale, ...overrides }}
      clubName="Águias FC"
      wasStarter={wasStarter}
      onClose={vi.fn()}
      onViewHistory={onViewHistory}
    />,
  )
  return { onViewHistory }
}

describe('SaleResultDialog', () => {
  it('deve mostrar multa, lucro, comissão, crédito e novo caixa devolvidos pela API', () => {
    renderDialog({}, true)

    expect(screen.getByText('Venda concluída')).toBeInTheDocument()
    expect(
      screen.getByText('Meia Lua voltou a ficar livre e saiu da escalação.'),
    ).toBeInTheDocument()
    expect(screen.getByText('10% do valor de venda, com teto de 10,00')).toBeInTheDocument()
    expect(screen.getByText('+3,00')).toHaveClass('text-green-700')
    expect(screen.getByText('10% do lucro até 10,00 + 20% do que passar')).toBeInTheDocument()
    expect(screen.getByText('+35,70')).toBeInTheDocument()
    expect(screen.getByText('RESCINDIDO')).toBeInTheDocument()
    expect(screen.getByText('Novo caixa do Águias FC')).toBeInTheDocument()
    expect(screen.getByText('296,85')).toBeInTheDocument()
  })

  it('deve explicar a venda sem multa e sem lucro', () => {
    renderDialog({
      penalty: 0,
      penalty_rate: 0,
      profit: -4.8,
      fee: 0,
      contract_status: 'ENCERRADO',
    })

    expect(
      screen.getByText(
        'Meia Lua voltou a ficar livre. A fidelidade já tinha terminado, então não houve multa.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Fidelidade cumprida: sem multa')).toBeInTheDocument()
    expect(screen.getByText('-4,80')).toHaveClass('text-red-600')
    expect(screen.getByText('Sem lucro: sem comissão')).toBeInTheDocument()
    expect(screen.getByText('ENCERRADO')).toBeInTheDocument()
  })

  it('deve levar ao histórico', async () => {
    const user = userEvent.setup()
    const { onViewHistory } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Ver histórico' }))
    expect(onViewHistory).toHaveBeenCalledOnce()
  })
})
