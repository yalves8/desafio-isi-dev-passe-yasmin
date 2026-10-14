import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { squadPlayerFixture } from '../../clubs.fixtures'
import { SquadTable } from './squad-table'

describe('SquadTable', () => {
  it('deve mostrar o contrato de cada jogador e iniciar a venda', async () => {
    const user = userEvent.setup()
    const onSell = vi.fn()
    const player = squadPlayerFixture()
    render(
      <MemoryRouter>
        <SquadTable players={[player]} onSell={onSell} />
      </MemoryRouter>,
    )

    const row = screen.getByText('Bruno Tavares').closest('tr')!
    expect(within(row).getByText('03/11/2028')).toBeInTheDocument()
    expect(within(row).getByText('11:20')).toBeInTheDocument()
    expect(within(row).getByText('722')).toBeInTheDocument()
    expect(within(row).getByText('20%')).toBeInTheDocument()
    await user.click(within(row).getByRole('button', { name: 'Vender Bruno Tavares' }))
    expect(onSell).toHaveBeenCalledWith(player)
  })

  it('deve levar aos jogadores livres quando o elenco está vazio', () => {
    render(
      <MemoryRouter>
        <SquadTable players={[]} onSell={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Nenhum jogador no elenco')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver jogadores livres/i })).toHaveAttribute(
      'href',
      '/jogadores?tab=free',
    )
  })
})
