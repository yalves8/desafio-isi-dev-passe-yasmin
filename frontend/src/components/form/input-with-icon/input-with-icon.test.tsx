import { render, screen } from '@testing-library/react'
import { Search } from 'lucide-react'
import { InputWithIcon } from './input-with-icon'

describe('InputWithIcon', () => {
  it('deve repassar as props para o input', () => {
    render(<InputWithIcon icon={Search} aria-label="Buscar por nome" placeholder="Buscar" />)

    expect(screen.getByRole('textbox', { name: 'Buscar por nome' })).toHaveAttribute(
      'placeholder',
      'Buscar',
    )
  })
})
