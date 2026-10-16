import { render, screen } from '@testing-library/react'
import { LegendItem } from './legend-item'

describe('LegendItem', () => {
  it('deve mostrar o quadradinho na cor pedida', () => {
    render(<LegendItem color="bg-primary">Valor do atributo</LegendItem>)

    const item = screen.getByText('Valor do atributo')
    expect(item.firstChild).toHaveClass('bg-primary')
  })

  it('deve usar o marcador próprio no lugar do quadradinho', () => {
    render(<LegendItem marker={<span>⚽</span>}>Gol no duelo</LegendItem>)

    expect(screen.getByText('⚽').parentElement).toHaveTextContent('Gol no duelo')
  })
})
