import { render, screen } from '@testing-library/react'
import { Tag } from './tag'

describe('Tag', () => {
  it('deve renderizar o texto com a variante pedida', () => {
    render(<Tag variant="success">Apto</Tag>)

    expect(screen.getByText('Apto')).toHaveClass('bg-green-50')
  })
})
