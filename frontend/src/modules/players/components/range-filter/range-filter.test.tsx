import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserRound } from 'lucide-react'
import { RangeFilter } from './range-filter'

describe('RangeFilter', () => {
  it('deve aplicar a faixa digitada', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(
      <RangeFilter
        icon={UserRound}
        label="Idade"
        unit="anos"
        bounds={{ min: 16, max: 45 }}
        decimals={0}
        onApply={onApply}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Idade' }))
    await user.type(screen.getByLabelText('Idade mínimo'), '18')
    await user.type(screen.getByLabelText('Idade máximo'), '30')
    await user.click(screen.getByRole('button', { name: 'Aplicar' }))

    expect(onApply).toHaveBeenCalledWith(18, 30)
  })

  it('deve bloquear Aplicar com faixa inválida', async () => {
    const user = userEvent.setup()
    render(
      <RangeFilter
        icon={UserRound}
        label="Idade"
        unit="anos"
        bounds={{ min: 16, max: 45 }}
        decimals={0}
        onApply={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Idade' }))
    await user.type(screen.getByLabelText('Idade mínimo'), '50')

    expect(screen.getByText('Use números inteiros de 16 a 45.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled()
  })
})
