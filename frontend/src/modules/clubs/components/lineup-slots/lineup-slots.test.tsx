import { render, screen, within } from '@testing-library/react'
import { squadPlayerFixture } from '../../clubs.fixtures'
import { LineupSlots } from './lineup-slots'

describe('LineupSlots', () => {
  it('deve mostrar os atributos que cada titular usa na vaga, como a API devolve', () => {
    const goalkeeper = squadPlayerFixture()
    const fullBack = squadPlayerFixture({
      id: 3,
      name: 'Diego Ramos',
      position: 'LAT',
      condition: 'MAL_CONDICIONADO',
    })
    // GET /clubs/{id}/duel-attributes
    const duelValues = new Map([
      [
        1,
        {
          attack: { attribute: 'defending', value: 77, match_value: 77 },
          defense: { attribute: 'defending', value: 77, match_value: 77 },
        },
      ],
      [
        3,
        {
          attack: { attribute: 'dribbling', value: 74, match_value: 63 },
          defense: { attribute: 'defending', value: 66, match_value: 56 },
        },
      ],
    ] as const)
    render(
      <LineupSlots
        rows={[
          { slot: { key: 'GK-1', sector: 'GK' }, player: goalkeeper, candidates: [goalkeeper] },
          { slot: { key: 'DEF-1', sector: 'DEF' }, candidates: [] },
          { slot: { key: 'DEF-2', sector: 'DEF' }, player: fullBack, candidates: [fullBack] },
        ]}
        duelRoles={[['defense'], ['defense'], ['attack', 'defense']]}
        duelValues={duelValues}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'Atributos usados' })).toBeInTheDocument()
    const [goalkeeperRow, emptyRow, fullBackRow] = screen.getAllByRole('row').slice(1)
    expect(within(goalkeeperRow).getByTestId('duel-attributes')).toHaveTextContent('Defesa 77')
    expect(within(emptyRow).queryByTestId('duel-attributes')).toBeNull()
    // Figma: o atributo cadastrado, sem o efeito da condição
    expect(within(fullBackRow).getByTestId('duel-attributes')).toHaveTextContent(
      'Drible 74Defesa 66',
    )
  })

  it('deve mostrar titular e overall, e travar a vaga sem candidatos', () => {
    const goalkeeper = squadPlayerFixture()
    render(
      <LineupSlots
        rows={[
          { slot: { key: 'GK-1', sector: 'GK' }, player: goalkeeper, candidates: [goalkeeper] },
          { slot: { key: 'MID-1', sector: 'MID' }, candidates: [], emptyText: 'Sem MEI no elenco' },
        ]}
        duelRoles={[]}
        duelValues={new Map()}
        onSelect={vi.fn()}
      />,
    )

    const goalkeeperRow = screen.getByText('Goleiro').closest('tr')!
    expect(within(goalkeeperRow).getByRole('combobox')).toHaveTextContent('Bruno Tavares (GOL)')
    expect(within(goalkeeperRow).getByText('71')).toBeInTheDocument()

    const midRow = screen.getByText('Meio').closest('tr')!
    expect(within(midRow).getByRole('combobox')).toBeDisabled()
    expect(within(midRow).getByRole('combobox')).toHaveTextContent('Sem MEI no elenco')
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
        duelRoles={[]}
        duelValues={new Map()}
        onSelect={vi.fn()}
      />,
    )

    const combobox = screen.getByRole('combobox')
    expect(combobox).toHaveAttribute('aria-invalid', 'true')
    expect(combobox).toHaveAccessibleDescription('Escolha o titular.')
  })

  it('deve numerar as vagas do mesmo setor para cada uma ter nome único', () => {
    render(
      <LineupSlots
        rows={[
          { slot: { key: 'GK-1', sector: 'GK' }, candidates: [] },
          { slot: { key: 'DEF-1', sector: 'DEF' }, candidates: [] },
          { slot: { key: 'DEF-2', sector: 'DEF' }, candidates: [] },
        ]}
        duelRoles={[]}
        duelValues={new Map()}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Goleiro GOL' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Defesa 1 ZAG ou LAT' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Defesa 2 ZAG ou LAT' })).toBe(
      screen.getByTestId('slot-DEF-2'),
    )
  })
})
