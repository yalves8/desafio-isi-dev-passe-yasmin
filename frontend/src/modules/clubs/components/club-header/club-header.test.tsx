import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { clubFixture } from '../../clubs.fixtures'
import { ClubHeader } from './club-header'

describe('ClubHeader', () => {
  it('deve mostrar nome, sigla e lotação, e levar aos jogadores livres', () => {
    render(
      <MemoryRouter>
        <ClubHeader club={clubFixture()} squadSize={6} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Águias FC' })).toBeInTheDocument()
    expect(screen.getByText('Sigla AGU')).toBeInTheDocument()
    expect(screen.getByText('6 de 12 jogadores')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /comprar jogadores/i })).toHaveAttribute(
      'href',
      '/jogadores?tab=free',
    )
  })
})
