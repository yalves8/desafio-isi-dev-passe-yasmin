import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Shirt } from 'lucide-react'
import { OptionFilter } from './option-filter'

const options = [
  { value: 'GOL', label: 'Goleiro' },
  { value: 'MEI', label: 'Meio-campo' },
]

describe('OptionFilter', () => {
  it('deve escolher uma opção e limpar pela opção "todas"', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(
      <OptionFilter
        icon={Shirt}
        label="Posição"
        allLabel="Todas as posições"
        options={options}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Posição' }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Meio-campo' }))
    expect(onChange).toHaveBeenLastCalledWith('MEI')

    rerender(
      <OptionFilter
        icon={Shirt}
        label="Posição"
        allLabel="Todas as posições"
        options={options}
        value="MEI"
        onChange={onChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Posição: Meio-campo' }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Todas as posições' }))
    expect(onChange).toHaveBeenLastCalledWith(undefined)
  })
})
