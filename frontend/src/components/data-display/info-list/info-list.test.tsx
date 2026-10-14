import { render, screen } from '@testing-library/react'
import { InfoList } from './info-list'

describe('InfoList', () => {
  it('deve listar rótulo, descrição e valor de cada item', () => {
    render(
      <InfoList
        items={[
          {
            label: 'Valor base',
            description: 'Calculado no cadastro',
            value: '26,00',
            highlight: true,
          },
          { label: 'Overall', value: 68 },
        ]}
      />,
    )

    expect(screen.getByText('Valor base')).toBeInTheDocument()
    expect(screen.getByText('Calculado no cadastro')).toBeInTheDocument()
    expect(screen.getByText('26,00')).toHaveClass('text-lg')
    expect(screen.getByText('68')).toBeInTheDocument()
  })
})
