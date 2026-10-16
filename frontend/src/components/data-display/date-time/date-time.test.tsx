import { render, screen } from '@testing-library/react'
import { DateTime } from './date-time'

// 14:20 em UTC é 11:20 no horário de Brasília
const ISO = '2028-11-03T14:20:00Z'

describe('DateTime', () => {
  it('deve mostrar data e hora de Brasília na mesma linha', () => {
    const { container } = render(<DateTime iso={ISO} />)

    expect(container).toHaveTextContent('03/11/2028 11:20')
    expect(screen.getByText('11:20')).toHaveClass('text-muted-foreground')
  })

  it('deve pôr a hora embaixo da data quando empilhado', () => {
    render(<DateTime iso={ISO} stacked />)

    expect(screen.getByText('03/11/2028').parentElement).toHaveClass('flex-col')
    expect(screen.getByText('11:20')).toHaveClass('text-xs')
  })
})
