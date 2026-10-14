import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionDialog } from './action-dialog'

describe('ActionDialog', () => {
  it('deve mostrar título, descrição, corpo e as duas ações', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    render(
      <ActionDialog
        title="Excluir Ícaro Mendes?"
        description="O jogador sai da lista."
        onClose={onClose}
        confirm={{ label: 'Excluir jogador', onClick: onConfirm }}
      >
        <p>corpo</p>
      </ActionDialog>,
    )

    expect(screen.getByRole('dialog', { name: 'Excluir Ícaro Mendes?' })).toBeInTheDocument()
    expect(screen.getByText('corpo')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Excluir jogador' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('deve travar os botões e não fechar enquanto envia', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <ActionDialog
        title="Novo jogador"
        busy
        onClose={onClose}
        confirm={{ label: 'Salvar jogador', busyLabel: 'Salvando…' }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('deve usar o papel alertdialog nas confirmações destrutivas', () => {
    render(
      <ActionDialog
        title="Excluir?"
        alert
        onClose={vi.fn()}
        confirm={{ label: 'Excluir', variant: 'destructive' }}
      />,
    )

    expect(screen.getByRole('alertdialog', { name: 'Excluir?' })).toBeInTheDocument()
  })
})
