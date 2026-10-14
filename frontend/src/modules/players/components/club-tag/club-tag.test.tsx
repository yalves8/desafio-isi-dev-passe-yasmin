import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ClubTag } from './club-tag'

const club = { id: 2, name: 'Delta FC', acronym: 'DEL', cash: 0, squad_value: 0, net_worth: 0 }

describe('ClubTag', () => {
  it('deve mostrar "Livre" quando o jogador não tem clube', () => {
    render(<ClubTag />)

    expect(screen.getByText('Livre')).toBeInTheDocument()
  })

  it('deve mostrar a sigla e o link para o clube', () => {
    render(
      <MemoryRouter>
        <ClubTag club={club} />
      </MemoryRouter>,
    )

    expect(screen.getByText('DEL')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Delta FC' })).toHaveAttribute('href', '/clubes/2')
  })

  it('deve mostrar só a sigla na variante compacta', () => {
    render(<ClubTag club={club} variant="acronym" />)

    expect(screen.getByText('DEL')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
