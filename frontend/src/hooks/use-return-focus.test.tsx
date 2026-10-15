import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'

function Page() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir
      </button>
      {open && (
        <ActionDialog
          title="Diálogo"
          onClose={() => setOpen(false)}
          confirm={{ label: 'Confirmar', onClick: () => setOpen(false) }}
        >
          <p>Conteúdo</p>
        </ActionDialog>
      )}
    </>
  )
}

describe('useReturnFocus', () => {
  it('deve devolver o foco a quem abriu o diálogo ao fechar com Esc', async () => {
    const user = userEvent.setup()
    render(<Page />)

    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus()
  })
})
