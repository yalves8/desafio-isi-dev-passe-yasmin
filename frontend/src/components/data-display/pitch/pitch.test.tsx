import { render, screen, within } from '@testing-library/react'
import { Pitch, PitchPlayer } from './pitch'

describe('Pitch', () => {
  it('deve ser uma imagem com o nome informado e mostrar os jogadores', () => {
    render(
      <Pitch orientation="horizontal" label="Campo com os titulares">
        <PitchPlayer name="Bruno Tavares" label="Bruno Tavares" detail="GOL · Defesa 70" />
      </Pitch>,
    )

    const pitch = screen.getByRole('img', { name: 'Campo com os titulares' })
    expect(within(pitch).getByText('BT')).toBeInTheDocument()
    expect(within(pitch).getByText('GOL · Defesa 70')).toBeInTheDocument()
  })
})

describe('PitchPlayer', () => {
  it('deve mostrar os selos de mal condicionado e de gol', () => {
    render(<PitchPlayer name="Ana Lima" label="Lima" worn scored />)

    expect(screen.getByTitle('Mal condicionado')).toBeInTheDocument()
    expect(screen.getByLabelText('Gol no duelo')).toBeInTheDocument()
  })

  it('deve mostrar a vaga vazia sem iniciais, só com o rótulo', () => {
    render(<PitchPlayer label="Meio" />)

    expect(screen.getByText('Meio')).toBeInTheDocument()
    expect(screen.queryByTitle('Mal condicionado')).not.toBeInTheDocument()
  })
})
