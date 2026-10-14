import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClubTabs } from './club-tabs'

describe('ClubTabs', () => {
  it('deve mostrar as contagens e trocar de aba', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ClubTabs value="elenco" counts={{ elenco: 6, historico: 10 }} onChange={onChange} />)

    expect(screen.getByRole('tab', { name: /elenco\s*6/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: /histórico\s*10/i })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /escalação/i }))
    expect(onChange).toHaveBeenCalledWith('escalacao')
  })
})
