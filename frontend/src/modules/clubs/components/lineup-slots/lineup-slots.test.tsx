import { render, screen, within } from '@testing-library/react'
import { squadPlayerFixture } from '../../clubs.fixtures'
import { LineupSlots } from './lineup-slots'

describe('LineupSlots', () => {
  it('deve mostrar titular e overall, e travar a vaga sem candidatos', () => {
    const goalkeeper = squadPlayerFixture()
    render(
      <LineupSlots
        rows={[
          { slot: { key: 'GK-1', sector: 'GK' }, player: goalkeeper, candidates: [goalkeeper] },
          { slot: { key: 'MID-1', sector: 'MID' }, candidates: [] },
        ]}
        onSelect={vi.fn()}
      />,
    )

    const goalkeeperRow = screen.getByText('Goleiro').closest('tr')!
    expect(within(goalkeeperRow).getByRole('combobox')).toHaveTextContent('Bruno Tavares (GOL)')
    expect(within(goalkeeperRow).getByText('71')).toBeInTheDocument()

    const midRow = screen.getByText('Meio').closest('tr')!
    expect(within(midRow).getByRole('combobox')).toBeDisabled()
    expect(within(midRow).getByRole('combobox')).toHaveTextContent('Nenhum MEI disponível')
  })

  it('deve mostrar a mensagem junto à vaga vazia', () => {
    const goalkeeper = squadPlayerFixture()
    render(
      <LineupSlots
        rows={[
          {
            slot: { key: 'GK-1', sector: 'GK' },
            candidates: [goalkeeper],
            error: 'Escolha o titular.',
          },
        ]}
        onSelect={vi.fn()}
      />,
    )

    const combobox = screen.getByRole('combobox')
    expect(combobox).toHaveAttribute('aria-invalid', 'true')
    expect(combobox).toHaveAccessibleDescription('Escolha o titular.')
  })
})
