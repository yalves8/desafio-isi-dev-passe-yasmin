import { render, screen } from '@testing-library/react'
import { PlayerIdentity } from './player-identity'

describe('PlayerIdentity', () => {
  it('deve mostrar as iniciais, o nome e o detalhe', () => {
    render(<PlayerIdentity id={3} name="Bruno Tavares" detail="Goleiro" />)

    expect(screen.getByText('BT')).toBeInTheDocument()
    expect(screen.getByText('Bruno Tavares')).toHaveClass('font-medium')
    expect(screen.getByText('Goleiro')).toHaveClass('text-xs')
  })

  it('deve mostrar só o nome quando não há detalhe', () => {
    const { container } = render(<PlayerIdentity id={3} name="Bruno Tavares" />)

    expect(container.querySelectorAll('.text-xs')).toHaveLength(1) // só as iniciais do avatar
  })
})
