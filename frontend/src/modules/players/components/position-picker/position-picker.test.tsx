import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PositionPicker } from './position-picker'

describe('PositionPicker', () => {
  it('deve marcar a posição escolhida', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PositionPicker value="ZAG" onChange={onChange} />)

    expect(screen.getByRole('radio', { name: /ZAG/ })).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('radio', { name: /MEI/ }))
    expect(onChange).toHaveBeenCalledWith('MEI')
  })

  it('deve travar as outras posições quando o jogador tem clube', () => {
    render(<PositionPicker value="ZAG" lockedTo="ZAG" onChange={vi.fn()} />)

    expect(screen.getByRole('radio', { name: /ZAG/ })).toBeEnabled()
    expect(screen.getByRole('radio', { name: /GOL/ })).toBeDisabled()
    expect(screen.getByRole('radio', { name: /ATA/ })).toBeDisabled()
  })
})
