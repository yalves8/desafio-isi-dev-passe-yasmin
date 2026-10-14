import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormationPicker } from './formation-picker'
import { formationDots } from './formation-picker.utils'

describe('FormationPicker', () => {
  it('deve marcar a formação e trocar ao clicar', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FormationPicker value="2-1-1" onChange={onChange} />)

    expect(screen.getByRole('radio', { name: /2-1-1/ })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: /^3-1/ }))
    expect(onChange).toHaveBeenCalledWith('3-1')
  })
})

describe('formationDots', () => {
  it('deve desenhar um ponto por jogador, do ataque ao goleiro', () => {
    expect(formationDots('2-1-1')).toEqual([
      { x: 16, y: 6.5 },
      { x: 16, y: 22 },
      { x: 10.5, y: 29.5 },
      { x: 21.5, y: 29.5 },
      { x: 16, y: 37 },
    ])
    expect(formationDots('3-1')).toHaveLength(5)
    expect(formationDots('2-2').filter((d) => d.y === 6.5)).toHaveLength(2)
  })
})
