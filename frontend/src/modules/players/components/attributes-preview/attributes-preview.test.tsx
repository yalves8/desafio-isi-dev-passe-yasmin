import { render, screen } from '@testing-library/react'
import { AttributesPreview } from './attributes-preview'

describe('AttributesPreview', () => {
  it('deve desenhar os atributos digitados com o potencial', () => {
    render(
      <AttributesPreview
        preview={{ status: 'ready', items: [{ label: 'Passe', value: 74 }], potential: 82 }}
      />,
    )

    expect(screen.getByRole('listitem')).toHaveTextContent('Passe74')
    expect(screen.getByText(/até o potencial \(82\)/)).toBeInTheDocument()
  })

  it('deve pedir correção quando há valores inválidos', () => {
    render(<AttributesPreview preview={{ status: 'invalid' }} />)

    expect(screen.getByText('Corrija os valores destacados para ver a prévia.')).toBeInTheDocument()
  })
})
