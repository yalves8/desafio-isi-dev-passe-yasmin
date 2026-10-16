import { render, screen } from '@testing-library/react'
import { SectionCard } from './section-card'

describe('SectionCard', () => {
  it('deve nomear a região pelo título e mostrar descrição, ações e conteúdo', () => {
    render(
      <SectionCard title="Duelos" description="Os 6 ataques." actions={<button>Filtrar</button>}>
        <p>conteúdo</p>
      </SectionCard>,
    )

    const region = screen.getByRole('region', { name: 'Duelos' })
    expect(region).toContainElement(screen.getByRole('heading', { level: 2, name: 'Duelos' }))
    expect(region).toHaveTextContent('Os 6 ataques.')
    expect(screen.getByRole('button', { name: 'Filtrar' })).toBeInTheDocument()
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })

  it('deve usar o nível de título pedido', () => {
    render(<SectionCard title="Reservas" headingLevel={3} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Reservas' })).toBeInTheDocument()
  })

  it('deve dar ids diferentes a dois cartões com o mesmo título', () => {
    render(
      <>
        <SectionCard title="Em campo" />
        <SectionCard title="Em campo" />
      </>,
    )

    const [first, second] = screen.getAllByRole('heading', { name: 'Em campo' })
    expect(first.id).not.toBe(second.id)
  })
})
