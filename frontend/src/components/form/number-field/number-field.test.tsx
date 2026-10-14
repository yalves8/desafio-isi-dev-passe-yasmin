import { render, screen } from '@testing-library/react'
import { NumberField } from './number-field'

const registration = { name: 'age', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() }

describe('NumberField', () => {
  it('deve marcar o campo como inválido e descrever pelo erro', () => {
    render(
      <NumberField id="age" label="Idade" error="Informe a idade." registration={registration} />,
    )

    const input = screen.getByLabelText('Idade')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('inputmode', 'numeric')
    expect(input).toHaveAccessibleDescription('Informe a idade.')
  })
})
