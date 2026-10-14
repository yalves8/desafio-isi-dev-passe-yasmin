import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { playerFixture } from '../../players.fixtures'
import { PlayersTable } from './players-table'
import type { PlayersTableProps } from './players-table.types'

const club = { id: 2, name: 'Delta FC', acronym: 'DEL', cash: 0, squad_value: 0, net_worth: 0 }

function renderTable(list: Partial<PlayersTableProps['list']> = {}) {
  const props: PlayersTableProps = {
    tabs: { value: 'all', counts: {}, onChange: vi.fn() },
    sort: { value: 'name', onChange: vi.fn() },
    list: {
      players: [],
      clubsById: new Map([[2, club]]),
      loading: false,
      error: null,
      onRetry: vi.fn(),
      empty: { hasFilters: false, onClear: vi.fn(), onCreate: vi.fn() },
      ...list,
    },
    actions: { onDetails: vi.fn(), onEdit: vi.fn(), onCondition: vi.fn(), onDelete: vi.fn() },
    pagination: {
      page: 1,
      totalPages: 1,
      pages: [1],
      summary: 'Mostrando 1–1 de 1 jogador',
      onChange: vi.fn(),
    },
  }
  render(
    <TooltipProvider>
      <MemoryRouter>
        <PlayersTable {...props} />
      </MemoryRouter>
    </TooltipProvider>,
  )
  return props
}

describe('PlayersTable', () => {
  it('deve mostrar cada coluna do jogador, com moedas em 2 casas', () => {
    renderTable({
      players: [playerFixture({ name: 'Diego Ramos', base_value: 39.44, market_value: 40.43 })],
    })

    const row = screen.getByText('Diego Ramos').closest('tr')!
    expect(within(row).getByText('39,44')).toBeInTheDocument()
    expect(within(row).getByText('40,43')).toBeInTheDocument()
    expect(within(row).getByRole('link', { name: 'Delta FC' })).toBeInTheDocument()
    expect(within(row).queryByRole('button', { name: /comprar/i })).not.toBeInTheDocument()
  })

  it('deve mostrar o estado de erro com nova tentativa', () => {
    renderTable({ error: 'Não foi possível conectar ao servidor.' })

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível conectar ao servidor.')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('deve oferecer cadastro quando a liga não tem jogadores', () => {
    renderTable()

    expect(screen.getByText('Cadastre o primeiro jogador da liga.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Novo jogador' })).toBeInTheDocument()
  })

  it('deve mostrar o esqueleto no primeiro carregamento', () => {
    renderTable({ loading: true })

    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
  })
})
