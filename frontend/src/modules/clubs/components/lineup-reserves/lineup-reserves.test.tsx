import { render, screen } from '@testing-library/react'
import { squadPlayerFixture } from '../../clubs.fixtures'
import { LineupReserves } from './lineup-reserves'

describe('LineupReserves', () => {
  it('deve avisar que jogador doente não pode ser escalado', () => {
    render(
      <LineupReserves
        reserves={[
          squadPlayerFixture({ name: 'Lucas Ferraz', position: 'MEI', condition: 'DOENTE' }),
        ]}
        squadSize={6}
      />,
    )

    expect(screen.getByText('Lucas Ferraz')).toBeInTheDocument()
    expect(screen.getByText('Doente não pode ser escalado.')).toBeInTheDocument()
  })

  it('deve explicar quando todos estão escalados', () => {
    render(<LineupReserves reserves={[]} squadSize={2} />)

    expect(
      screen.getByText('Nenhum reserva: os 2 jogadores do elenco estão escolhidos.'),
    ).toBeInTheDocument()
  })
})
