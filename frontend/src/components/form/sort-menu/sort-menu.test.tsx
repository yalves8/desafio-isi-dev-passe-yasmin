import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SortMenu } from './sort-menu'

const OPTIONS = [
  { value: 'name', label: 'Nome', short: 'nome' },
  { value: 'age_desc', label: 'Maior idade', short: 'maior idade' },
] as const

describe('SortMenu', () => {
  it('deve mostrar a ordenação atual e avisar a escolhida', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SortMenu options={[...OPTIONS]} value="name" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Ordenar: nome' }))
    expect(screen.getByRole('menuitemradio', { name: 'Nome' })).toBeChecked()
    await user.click(screen.getByRole('menuitemradio', { name: 'Maior idade' }))

    expect(onChange).toHaveBeenCalledWith('age_desc')
  })

  it('deve cair na primeira opção quando o valor não existe', () => {
    render(<SortMenu options={[...OPTIONS]} value={'xyz' as 'name'} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Ordenar: nome' })).toBeInTheDocument()
  })
})
