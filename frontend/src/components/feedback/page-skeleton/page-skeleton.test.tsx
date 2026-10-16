import { render, screen } from '@testing-library/react'
import { PageSkeleton } from './page-skeleton'

describe('PageSkeleton', () => {
  it('deve anunciar o carregamento com o texto informado', () => {
    render(
      <PageSkeleton label="Carregando clube">
        <div>esqueleto</div>
      </PageSkeleton>,
    )

    expect(screen.getByRole('status', { name: 'Carregando clube' })).toHaveTextContent('esqueleto')
  })
})
