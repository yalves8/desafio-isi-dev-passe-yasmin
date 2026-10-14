import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PlayerFilters } from './player-filters'
import type { PlayerFiltersProps } from './player-filters.types'

const range = { bounds: { min: 0, max: 99 }, decimals: 0, onApply: vi.fn() }
const option = { options: [], onChange: vi.fn() }

function renderFilters(overrides: Partial<PlayerFiltersProps> = {}) {
  const props: PlayerFiltersProps = {
    search: { value: '', onChange: vi.fn() },
    position: option,
    condition: option,
    club: option,
    age: range,
    value: range,
    ...overrides,
  }
  render(
    <TooltipProvider>
      <PlayerFilters {...props} />
    </TooltipProvider>,
  )
  return props
}

describe('PlayerFilters', () => {
  it('deve repassar o texto digitado na busca', async () => {
    const user = userEvent.setup()
    const props = renderFilters()

    await user.type(screen.getByRole('searchbox', { name: 'Buscar por nome' }), 'j')

    expect(props.search.onChange).toHaveBeenCalledWith('j')
  })

  it('deve desabilitar o filtro por clube com o motivo', () => {
    renderFilters({
      club: { ...option, disabledReason: '“Livres” não combina com o filtro por clube.' },
    })

    expect(screen.getByRole('button', { name: 'Clube' })).toBeDisabled()
    expect(
      screen.getByLabelText('“Livres” não combina com o filtro por clube.'),
    ).toBeInTheDocument()
  })
})
