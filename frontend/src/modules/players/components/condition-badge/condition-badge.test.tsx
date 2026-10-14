import { render, screen } from '@testing-library/react'
import { ConditionBadge } from './condition-badge'

describe('ConditionBadge', () => {
  it.each([
    ['APTO', 'Apto', 'bg-green-50'],
    ['MAL_CONDICIONADO', 'Mal condicionado', 'bg-amber-50'],
    ['DOENTE', 'Doente', 'bg-red-50'],
  ] as const)('deve mostrar %s com o rótulo e a cor da condição', (condition, label, tone) => {
    render(<ConditionBadge condition={condition} />)

    expect(screen.getByText(label)).toHaveClass(tone)
  })
})
