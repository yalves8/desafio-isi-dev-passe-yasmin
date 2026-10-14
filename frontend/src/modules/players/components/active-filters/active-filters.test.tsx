import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActiveFilters } from './active-filters'

describe('ActiveFilters', () => {
  it('não deve renderizar nada sem filtros', () => {
    const { container } = render(
      <ActiveFilters chips={[]} searchOnly={false} onRemove={vi.fn()} onClear={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('deve remover um chip e limpar todos', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    const onClear = vi.fn()
    render(
      <ActiveFilters
        chips={[{ key: 'age', label: 'Idade: 18 a 30' }]}
        searchOnly={false}
        onRemove={onRemove}
        onClear={onClear}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remover Idade: 18 a 30' }))
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(onRemove).toHaveBeenCalledWith('age')
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('deve usar o rótulo de busca quando só a busca está ativa', () => {
    render(
      <ActiveFilters
        chips={[{ key: 'search', label: 'Busca: joao' }]}
        searchOnly
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    expect(screen.getByText('Resultados para a busca:')).toBeInTheDocument()
  })
})
