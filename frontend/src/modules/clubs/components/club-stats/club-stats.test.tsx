import { render, screen } from '@testing-library/react'
import { clubFixture } from '../../clubs.fixtures'
import { ClubStats } from './club-stats'

describe('ClubStats', () => {
  it('deve mostrar os valores do clube em moedas', () => {
    render(<ClubStats club={clubFixture()} squadSize={6} />)

    expect(screen.getByText('51,58')).toBeInTheDocument()
    expect(screen.getByText('222,68')).toBeInTheDocument()
    expect(screen.getByText('274,26')).toBeInTheDocument()
    expect(screen.getByText('6 de 12')).toBeInTheDocument()
  })
})
