import { render } from '@testing-library/react'
import { SoccerBall } from './soccer-ball'

describe('SoccerBall', () => {
  it('deve desenhar a bola com o pentágono central e os 5 da borda, repassando as props', () => {
    const { container } = render(<SoccerBall className="size-4" aria-label="Gol no duelo" />)
    const svg = container.querySelector('svg')!

    expect(svg).toHaveClass('size-4')
    expect(svg).toHaveAttribute('aria-label', 'Gol no duelo')
    expect(svg.querySelectorAll('polygon')).toHaveLength(6)
  })
})
