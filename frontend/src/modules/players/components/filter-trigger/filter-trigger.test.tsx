import { render, screen } from '@testing-library/react'
import { Shield } from 'lucide-react'
import { FilterTrigger } from './filter-trigger'

describe('FilterTrigger', () => {
  it('deve destacar o filtro com valor ativo', () => {
    render(<FilterTrigger icon={Shield} label="Clube: Delta FC" active />)

    expect(screen.getByRole('button', { name: 'Clube: Delta FC' })).toHaveClass('text-foreground')
  })
})
