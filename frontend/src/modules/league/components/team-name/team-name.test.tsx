import { render, screen } from '@testing-library/react'
import { matchFixture } from '../../league.fixtures'
import { TeamName } from './team-name'

describe('TeamName', () => {
  it('deve pôr em negrito só o vencedor', () => {
    const match = matchFixture({ result: 'VISITANTE' })
    render(
      <>
        <TeamName match={match} side="home" />
        <TeamName match={match} side="away" />
      </>,
    )

    expect(screen.getByText('Águias FC')).not.toHaveClass('font-semibold')
    expect(screen.getByText('Delta FC')).toHaveClass('font-semibold')
  })

  it('não deve destacar ninguém no empate', () => {
    const match = matchFixture({ result: 'EMPATE' })
    render(
      <>
        <TeamName match={match} side="home" />
        <TeamName match={match} side="away" />
      </>,
    )

    expect(screen.getByText('Águias FC')).not.toHaveClass('font-semibold')
    expect(screen.getByText('Delta FC')).not.toHaveClass('font-semibold')
  })
})
