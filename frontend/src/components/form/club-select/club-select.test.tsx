import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClubSelect } from './club-select'

const CLUBS = [
  { id: 1, name: 'Águias FC', acronym: 'AGU', cash: 300 },
  { id: 2, name: 'Tubarões EC', acronym: 'TUB', cash: 150.5 },
]

describe('ClubSelect', () => {
  it('deve listar os clubes e avisar o id escolhido', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ClubSelect id="home" clubs={CLUBS} onChange={onChange} />)

    const combobox = screen.getByRole('combobox')
    expect(combobox).toHaveTextContent('Escolha o clube')
    await user.click(combobox)
    await user.click(await screen.findByRole('option', { name: 'Tubarões EC (TUB)' }))

    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('deve mostrar o caixa quando pedido', async () => {
    const user = userEvent.setup()
    render(<ClubSelect id="buyer" clubs={CLUBS} onChange={vi.fn()} showCash />)

    await user.click(screen.getByRole('combobox'))

    expect(
      await screen.findByRole('option', { name: 'Águias FC (AGU) · caixa 300,00' }),
    ).toBeInTheDocument()
  })

  it('deve mostrar o clube escolhido e marcar o campo inválido', () => {
    render(<ClubSelect id="away" clubs={CLUBS} value={1} onChange={vi.fn()} invalid />)

    const combobox = screen.getByRole('combobox')
    expect(combobox).toHaveTextContent('Águias FC (AGU)')
    expect(combobox).toHaveAttribute('aria-invalid', 'true')
    expect(combobox).toHaveAttribute('aria-describedby', 'away-message')
  })
})
