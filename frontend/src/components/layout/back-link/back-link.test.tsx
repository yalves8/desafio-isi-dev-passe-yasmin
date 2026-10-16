import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { BackLink } from './back-link'

describe('BackLink', () => {
  it('deve levar ao endereço com o texto informado', () => {
    render(
      <MemoryRouter>
        <BackLink to="/clubes" label="Voltar para clubes" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Voltar para clubes' })).toHaveAttribute(
      'href',
      '/clubes',
    )
  })
})
