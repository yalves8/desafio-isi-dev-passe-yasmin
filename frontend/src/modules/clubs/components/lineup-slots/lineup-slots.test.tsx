import { render, screen, within } from '@testing-library/react'
import { squadPlayerFixture } from '../../clubs.fixtures'
import { LineupSlots } from './lineup-slots'

describe('LineupSlots', () => {
  it('deve mostrar titular, overall e atributos usados, e travar a vaga sem candidatos', () => {
    const gol = squadPlayerFixture()
    render(
      <LineupSlots
        rows={[
          {
            slot: { key: 'GOL-1', sector: 'GOL' },
            player: gol,
            candidates: [gol],
            attributes: [{ label: 'Defesa', value: 77 }],
          },
          { slot: { key: 'MID-1', sector: 'MID' }, candidates: [], attributes: [] },
        ]}
        onSelect={vi.fn()}
      />,
    )

    const golRow = screen.getByText('Goleiro').closest('tr')!
    expect(within(golRow).getByRole('combobox')).toHaveTextContent('Bruno Tavares (GOL)')
    expect(within(golRow).getByText('71')).toBeInTheDocument()
    expect(within(golRow).getByText('77')).toBeInTheDocument()

    const midRow = screen.getByText('Meio').closest('tr')!
    expect(within(midRow).getByRole('combobox')).toBeDisabled()
    expect(within(midRow).getByRole('combobox')).toHaveTextContent('Sem MEI no elenco')
  })
})
