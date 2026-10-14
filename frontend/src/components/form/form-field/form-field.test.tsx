import { render, screen } from '@testing-library/react'
import { FormField } from './form-field'

describe('FormField', () => {
  it('deve ligar o rótulo ao controle e mostrar a dica', () => {
    render(
      <FormField id="idade" label="Idade" hint="De 16 a 45 anos.">
        <input id="idade" />
      </FormField>,
    )

    expect(screen.getByLabelText('Idade')).toBeInTheDocument()
    expect(screen.getByText('De 16 a 45 anos.')).toHaveAttribute('id', 'idade-message')
  })

  it('deve trocar a dica pela mensagem de erro', () => {
    render(
      <FormField
        id="idade"
        label="Idade"
        hint="De 16 a 45 anos."
        error="Use uma idade de 16 a 45 anos."
      >
        <input id="idade" />
      </FormField>,
    )

    expect(screen.queryByText('De 16 a 45 anos.')).not.toBeInTheDocument()
    expect(screen.getByText('Use uma idade de 16 a 45 anos.')).toBeInTheDocument()
  })
})
