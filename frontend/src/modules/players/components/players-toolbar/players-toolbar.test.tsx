import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PlayersToolbar } from './players-toolbar'
import type { PlayersToolbarProps } from './players-toolbar.types'

function renderToolbar(tabs: Partial<PlayersToolbarProps['tabs']> = {}) {
  const props: PlayersToolbarProps = {
    tabs: { value: 'all', counts: { all: 23, free: 7, clubs: 16 }, onChange: vi.fn(), ...tabs },
    sort: { value: 'name', onChange: vi.fn() },
  }
  render(
    <TooltipProvider>
      <PlayersToolbar {...props} />
    </TooltipProvider>,
  )
  return props
}

describe('PlayersToolbar', () => {
  it('deve mostrar a contagem de cada aba e trocar de aba', async () => {
    const user = userEvent.setup()
    const props = renderToolbar()

    expect(screen.getByRole('tab', { name: /todos\s*23/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await user.click(screen.getByRole('tab', { name: /livres\s*7/i }))
    expect(props.tabs.onChange).toHaveBeenCalledWith('free')
  })

  it('deve desabilitar "Livres" quando há filtro por clube', () => {
    renderToolbar({ freeDisabledReason: 'Livres não combina com clube' })

    expect(screen.getByRole('tab', { name: /livres/i })).toBeDisabled()
  })

  it('deve trocar a ordenação', async () => {
    const user = userEvent.setup()
    const props = renderToolbar()

    await user.click(screen.getByRole('button', { name: 'Ordenar: nome' }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Menor idade' }))
    expect(props.sort.onChange).toHaveBeenCalledWith('age_asc')
  })
})
