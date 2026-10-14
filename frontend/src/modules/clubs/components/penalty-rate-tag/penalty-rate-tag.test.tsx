import { render, screen } from '@testing-library/react'
import { PenaltyRateTag } from './penalty-rate-tag'

describe('PenaltyRateTag', () => {
  it.each([
    [0, '0%', 'bg-green-50'],
    [5, '5%', 'bg-amber-50'],
    [10, '10%', 'bg-amber-50'],
    [20, '20%', 'bg-red-50'],
  ])('deve colorir %s%% de multa', (rate, text, tone) => {
    render(<PenaltyRateTag rate={rate} />)

    expect(screen.getByText(text)).toHaveClass(tone)
  })
})
