import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { squadPlayerFixture } from '../../clubs.fixtures'
import { SellPlayerDialog } from './sell-player-dialog'
import type { SellPlayerDialogProps } from './sell-player-dialog.types'

function renderDialog(props: Partial<SellPlayerDialogProps> = {}) {
  return render(
    <SellPlayerDialog
      player={squadPlayerFixture({ market_value: 40 })}
      clubName="Águias FC"
      isStarter={false}
      isSelling={false}
      onClose={vi.fn()}
      onConfirm={vi.fn()}
      {...props}
    />,
  )
}

describe('SellPlayerDialog', () => {
  it('deve mostrar o valor de mercado e o contrato e confirmar a venda', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    renderDialog({ onConfirm })

    expect(screen.getByRole('dialog', { name: 'Vender Bruno Tavares?' })).toBeInTheDocument()
    expect(
      screen.getByText('O jogador sai do elenco do Águias FC e volta a ficar livre.'),
    ).toBeInTheDocument()
    expect(screen.getByText('40,00')).toBeInTheDocument()
    expect(screen.getByText('% de multa se vender agora')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()
    expect(screen.queryByRole('note')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirmar venda' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('deve avisar quando o jogador é titular', () => {
    renderDialog({ isStarter: true })

    expect(screen.getByRole('note')).toHaveTextContent('Bruno Tavares é titular')
  })

  it('deve mostrar a recusa da API no lugar do aviso de titular', () => {
    renderDialog({
      isStarter: true,
      error: { kind: 'refused', message: 'Bruno Tavares já está livre e não pode ser vendido.' },
    })

    expect(screen.getByRole('alert')).toHaveTextContent('A venda foi recusada')
    expect(screen.queryByText('Bruno Tavares é titular')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar venda' })).toBeEnabled()
  })

  it('deve mostrar "Sem conexão" e oferecer tentar de novo quando a resposta não chega', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    renderDialog({
      onConfirm,
      error: { kind: 'network', message: 'A venda não foi confirmada.' },
    })

    expect(screen.getByRole('alert')).toHaveTextContent('Sem conexãoA venda não foi confirmada.')
    expect(screen.queryByText('A venda foi recusada')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('deve travar enquanto vende', () => {
    renderDialog({ isSelling: true })

    expect(screen.getByRole('button', { name: 'Vendendo…' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Enviando a venda.')
  })
})
