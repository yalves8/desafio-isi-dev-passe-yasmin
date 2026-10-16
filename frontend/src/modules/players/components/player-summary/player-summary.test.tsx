import { render, screen } from '@testing-library/react'
import { playerFixture } from '../../players.fixtures'
import { PlayerSummary } from './player-summary'

describe('PlayerSummary', () => {
  it('deve mostrar nome, posição e idade', () => {
    render(
      <PlayerSummary player={playerFixture({ name: 'Ícaro Mendes', position: 'ATA', age: 40 })} />,
    )

    expect(screen.getByText('Ícaro Mendes')).toBeInTheDocument()
    expect(screen.getByText('ATA · Atacante · 40 anos')).toBeInTheDocument()
  })

  it('deve mostrar o valor de mercado à direita', () => {
    render(<PlayerSummary player={playerFixture({ market_value: 52 })} showMarketValue />)

    expect(screen.getByText('Valor de mercado')).toBeInTheDocument()
    expect(screen.getByText('52,00')).toBeInTheDocument()
  })
})
