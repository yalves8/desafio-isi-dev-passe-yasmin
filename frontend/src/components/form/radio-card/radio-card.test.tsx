import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RadioGroup } from '@/components/ui/radio-group'
import { RadioCard } from './radio-card'

function renderCards(onValueChange = vi.fn(), value = 'a') {
  render(
    <RadioGroup value={value} onValueChange={onValueChange} aria-label="Opções">
      {['a', 'b', 'c'].map((v) => (
        <RadioCard key={v} id={`opt-${v}`} value={v} checked={value === v} disabled={v === 'c'}>
          {(radio) => (
            <>
              {radio}
              <span>Opção {v.toUpperCase()}</span>
            </>
          )}
        </RadioCard>
      ))}
    </RadioGroup>,
  )
  return onValueChange
}

describe('RadioCard', () => {
  it('deve escolher a opção ao clicar no cartão', async () => {
    const user = userEvent.setup()
    const onValueChange = renderCards()

    await user.click(screen.getByText('Opção B'))

    expect(onValueChange).toHaveBeenCalledWith('b')
  })

  it('deve marcar o escolhido e travar o desabilitado', () => {
    renderCards()

    expect(screen.getByRole('radio', { name: 'Opção A' })).toBeChecked()
    expect(screen.getByText('Opção A').closest('label')).toHaveClass('border-primary')
    expect(screen.getByRole('radio', { name: 'Opção C' })).toBeDisabled()
    expect(screen.getByText('Opção C').closest('label')).toHaveClass('cursor-not-allowed')
  })
})
