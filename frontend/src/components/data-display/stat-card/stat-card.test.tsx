import { render, screen } from '@testing-library/react'
import { Coins } from 'lucide-react'
import { StatCard } from './stat-card'

describe('StatCard', () => {
  it('deve mostrar rótulo, valor e origem', () => {
    render(
      <StatCard
        label="Valor de mercado"
        value="46,00"
        hint="Calculado automaticamente"
        icon={Coins}
      />,
    )

    expect(screen.getByText('Valor de mercado')).toBeInTheDocument()
    expect(screen.getByText('46,00')).toBeInTheDocument()
    expect(screen.getByText('Calculado automaticamente')).toBeInTheDocument()
  })
})
