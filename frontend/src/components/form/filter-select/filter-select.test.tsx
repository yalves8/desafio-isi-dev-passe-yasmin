import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Shield } from 'lucide-react'
import { FilterSelect } from './filter-select'
import type { FilterSelectProps } from './filter-select.types'

const OPTIONS = [
  { value: '1', label: 'Águias FC' },
  { value: '2', label: 'Tubarões EC' },
]

function renderFilter(props: Partial<FilterSelectProps> = {}) {
  const onChange = vi.fn()
  render(
    <FilterSelect
      icon={Shield}
      label="Filtrar por clube"
      prefix="Clube"
      allLabel="Todos os clubes"
      options={OPTIONS}
      onChange={onChange}
      {...props}
    />,
  )
  return onChange
}

describe('FilterSelect', () => {
  it('deve mostrar "todos" sem filtro', () => {
    renderFilter()
    expect(screen.getByRole('combobox', { name: 'Filtrar por clube' })).toHaveTextContent(
      'Clube: todos',
    )
  })

  it('deve mostrar a opção escolhida', () => {
    renderFilter({ value: '2' })
    expect(screen.getByRole('combobox', { name: 'Filtrar por clube' })).toHaveTextContent(
      'Clube: Tubarões EC',
    )
  })

  it('deve avisar a opção escolhida e `undefined` ao tirar o filtro', async () => {
    const user = userEvent.setup()
    const onChange = renderFilter({ value: '1' })

    await user.click(screen.getByRole('combobox', { name: 'Filtrar por clube' }))
    await user.click(await screen.findByRole('option', { name: 'Tubarões EC' }))
    expect(onChange).toHaveBeenLastCalledWith('2')

    await user.click(screen.getByRole('combobox', { name: 'Filtrar por clube' }))
    await user.click(await screen.findByRole('option', { name: 'Todos os clubes' }))
    expect(onChange).toHaveBeenLastCalledWith(undefined)
  })
})
