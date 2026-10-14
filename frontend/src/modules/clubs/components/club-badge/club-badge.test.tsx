import { render, screen } from '@testing-library/react'
import { ClubBadge } from './club-badge'

describe('ClubBadge', () => {
  it('deve mostrar a sigla', () => {
    render(<ClubBadge acronym="AGU" size="lg" />)

    expect(screen.getByText('AGU')).toHaveClass('size-12')
  })
})
