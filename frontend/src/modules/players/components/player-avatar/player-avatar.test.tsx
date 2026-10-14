import { render, screen } from '@testing-library/react'
import { PlayerAvatar } from './player-avatar'

describe('PlayerAvatar', () => {
  it('deve mostrar as iniciais do primeiro e do último nome, com acento', () => {
    render(<PlayerAvatar id={6} name="Ênio  Carvalho" />)

    expect(screen.getByText('ÊC')).toBeInTheDocument()
  })
})
