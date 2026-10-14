import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PurchaseResult } from '@/api/types'
import { PurchaseResultDialog } from './purchase-result-dialog'

const purchase: PurchaseResult = {
  id: 10,
  club_id: 6,
  player_id: 9,
  player_name: 'Eduardo Paiva',
  type: 'COMPRA',
  value: 46,
  fee: 2.3,
  penalty: 0,
  profit: null,
  cash_change: -48.3,
  created_at: '2026-11-12T15:00:00-03:00',
  contract: { purchase_value: 46, loyalty_until: '2027-11-12T15:00:00-03:00', status: 'ATIVO' },
  club_cash: 251.7,
}

describe('PurchaseResultDialog', () => {
  it('deve mostrar valor, taxa, custo, contrato e novo caixa devolvidos pela API', () => {
    render(
      <PurchaseResultDialog
        purchase={purchase}
        clubName="Tubarões EC"
        onClose={vi.fn()}
        onViewClub={vi.fn()}
      />,
    )

    expect(screen.getByText('Eduardo Paiva agora é do Tubarões EC.')).toBeInTheDocument()
    expect(screen.getByText('46,00')).toBeInTheDocument()
    expect(screen.getByText('5% do valor, porque passa de 30,00')).toBeInTheDocument()
    expect(screen.getByText('2,30')).toBeInTheDocument()
    expect(screen.getByText('48,30')).toBeInTheDocument()
    expect(screen.getByText('12/11/2027, 15:00')).toBeInTheDocument()
    expect(screen.getByText('ATIVO')).toBeInTheDocument()
    expect(screen.getByText('Novo caixa do Tubarões EC')).toBeInTheDocument()
    expect(screen.getByText('251,70')).toBeInTheDocument()
  })

  it('deve explicar quando não há taxa e levar ao clube', async () => {
    const user = userEvent.setup()
    const onViewClub = vi.fn()
    render(
      <PurchaseResultDialog
        purchase={{ ...purchase, value: 28, fee: 0, cash_change: -28 }}
        clubName="Tubarões EC"
        onClose={vi.fn()}
        onViewClub={onViewClub}
      />,
    )

    expect(screen.getByText('Sem taxa: o valor não passa de 30,00')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Ver clube/ }))
    expect(onViewClub).toHaveBeenCalled()
  })
})
