import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { clubFixture } from '../../clubs.fixtures'
import { ClubsTable } from './clubs-table'
import type { ClubsTableProps } from './clubs-table.types'

function renderTable(props: Partial<ClubsTableProps> = {}) {
  render(
    <MemoryRouter>
      <ClubsTable
        clubs={[]}
        loading={false}
        error={null}
        onRetry={vi.fn()}
        onCreate={vi.fn()}
        canCreate
        sort="name"
        onSortChange={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('ClubsTable', () => {
  it('deve mostrar caixa, valor do elenco e patrimônio em moedas', () => {
    renderTable({ clubs: [clubFixture()] })

    const row = screen.getByText('Águias FC').closest('tr')!
    expect(within(row).getByText('51,58')).toBeInTheDocument()
    expect(within(row).getByText('222,68')).toBeInTheDocument()
    expect(within(row).getByText('274,26')).toBeInTheDocument()
    expect(within(row).getByRole('link', { name: 'Ver clube Águias FC' })).toHaveAttribute(
      'href',
      '/clubes/1',
    )
  })

  it('deve mostrar o estado vazio com a criação do primeiro clube', () => {
    renderTable()

    expect(screen.getByText('Nenhum clube cadastrado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /novo clube/i })).toBeEnabled()
  })

  it('deve mostrar o erro com nova tentativa', () => {
    renderTable({ error: 'Não foi possível conectar ao servidor.' })

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível conectar ao servidor.')
  })
})
