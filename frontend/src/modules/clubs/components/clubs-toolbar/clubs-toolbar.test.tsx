import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClubsToolbar } from './clubs-toolbar'

describe('ClubsToolbar', () => {
  it('deve mostrar o uso do limite e trocar a ordenação', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    render(<ClubsToolbar total={6} sort="name" onSortChange={onSortChange} />)

    expect(screen.getByText('6 de 20')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ordenar: nome' }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Patrimônio (maior para o menor)' }))
    expect(onSortChange).toHaveBeenCalledWith('net_worth_desc')
  })
})
