import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Inbox } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'
import { DataTable } from './data-table'
import type { DataTableProps } from './data-table.types'

type Row = { id: number; name: string }

function renderTable(props: Partial<DataTableProps<Row>> = {}) {
  render(
    <DataTable<Row>
      columns={[{ label: 'Nome' }, { label: 'Ações', srOnly: true }]}
      rows={[]}
      rowKey={(row) => row.id}
      renderRow={(row) => (
        <TableRow>
          <TableCell>{row.name}</TableCell>
          <TableCell />
        </TableRow>
      )}
      empty={{ icon: Inbox, title: 'Nada por aqui' }}
      toolbar={<p>Barra</p>}
      footer={<p>Rodapé</p>}
      {...props}
    />,
  )
}

describe('DataTable', () => {
  it('deve mostrar o cabeçalho e uma linha por item, com a barra e o rodapé', () => {
    renderTable({ rows: [{ id: 1, name: 'Águias FC' }] })

    expect(screen.getByRole('columnheader', { name: 'Nome' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Ações' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Águias FC' })).toBeInTheDocument()
    expect(screen.getByText('Barra')).toBeInTheDocument()
    expect(screen.getByText('Rodapé')).toBeInTheDocument()
  })

  it('deve mostrar o esqueleto no primeiro carregamento, sem o rodapé', () => {
    renderTable({ loading: true, loadingLabel: 'Carregando clubes', skeletonRows: 3 })

    expect(screen.getByRole('status', { name: 'Carregando clubes' })).toBeInTheDocument()
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getAllByRole('row', { hidden: true })).toHaveLength(4)
    expect(screen.queryByText('Rodapé')).not.toBeInTheDocument()
  })

  it('deve trocar a tabela pelo estado vazio', () => {
    renderTable()

    expect(screen.getByText('Nada por aqui')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByText('Barra')).not.toBeInTheDocument()
  })

  it('deve trocar a tabela pelo erro com nova tentativa', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    renderTable({
      rows: [{ id: 1, name: 'Águias FC' }],
      error: 'Não foi possível conectar ao servidor.',
      errorTitle: 'Não foi possível carregar os clubes',
      onRetry,
    })

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os clubes')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
