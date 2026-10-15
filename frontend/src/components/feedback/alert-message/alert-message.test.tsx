import { render, screen } from '@testing-library/react'
import { AlertMessage } from './alert-message'

describe('AlertMessage', () => {
  it('deve anunciar o erro com o título e a mensagem', () => {
    render(
      <AlertMessage variant="error" title="Compra recusada">
        O clube não tem caixa suficiente.
      </AlertMessage>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Compra recusadaO clube não tem caixa suficiente.',
    )
  })

  it('deve mostrar o aviso como nota, sem interromper o leitor de tela', () => {
    render(
      <AlertMessage variant="warning" title="Escalação incompleta">
        Escolha os titulares.
      </AlertMessage>,
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent('Escalação incompleta')
  })
})
