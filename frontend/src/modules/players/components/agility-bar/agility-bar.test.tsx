import { render, screen } from '@testing-library/react'
import { AgilityBar } from './agility-bar'
import { getAgilityTone } from './agility-bar.utils'

describe('AgilityBar', () => {
  it('deve mostrar o valor da agilidade', () => {
    render(<AgilityBar value={83} />)

    expect(screen.getByText('83')).toBeInTheDocument()
  })

  it('deve colorir pelas faixas que mudam o desconto', () => {
    expect(getAgilityTone(80)).toBe('bg-green-700')
    expect(getAgilityTone(30)).toBe('bg-red-600')
    expect(getAgilityTone(55)).toBe('bg-zinc-500')
  })
})
