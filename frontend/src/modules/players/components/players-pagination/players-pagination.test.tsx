import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayersPagination } from './players-pagination'

describe('PlayersPagination', () => {
  it('deve navegar entre páginas e travar nas pontas', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <PlayersPagination
        page={1}
        totalPages={3}
        pages={[1, 2, 3]}
        summary="Mostrando 1–10 de 23 jogadores"
        onChange={onChange}
      />,
    )

    expect(screen.getByText('Mostrando 1–10 de 23 jogadores')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page')
    await user.click(screen.getByRole('button', { name: 'Página 3' }))
    await user.click(screen.getByRole('button', { name: /próxima/i }))
    expect(onChange.mock.calls).toEqual([[3], [2]])
  })
})
