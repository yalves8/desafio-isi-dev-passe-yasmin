import { render, screen } from '@testing-library/react'
import { PositionBadge } from './position-badge'

describe('PositionBadge', () => {
  it('deve mostrar a sigla com o nome da posição no title', () => {
    render(<PositionBadge position="MEI" />)

    expect(screen.getByText('MEI')).toHaveAttribute('title', 'Meio-campo')
  })
})
