import { render, screen } from '@testing-library/react'
import { FormField } from './form-field'

describe('FormField', () => {
  it('deve ligar o rótulo ao controle e mostrar a dica', () => {
    render(
      <FormField id="age" label="Idade" hint="De 16 a 45 anos.">
        <input id="age" />
      </FormField>,
    )

    expect(screen.getByLabelText('Idade')).toBeInTheDocument()
    expect(screen.getByText('De 16 a 45 anos.')).toHaveAttribute('id', 'age-message')
  })

  it('deve trocar a dica pela mensagem de erro', () => {
    render(
      <FormField
        id="age"
        label="Idade"
        hint="De 16 a 45 anos."
        error="Use uma idade de 16 a 45 anos."
      >
        <input id="age" />
      </FormField>,
    )

    expect(screen.queryByText('De 16 a 45 anos.')).not.toBeInTheDocument()
    expect(screen.getByText('Use uma idade de 16 a 45 anos.')).toBeInTheDocument()
  })

  it('deve rotular um grupo de opções pelo aria-labelledby', () => {
    render(
      <FormField id="position" label="Posição" error="Escolha a posição" group>
        <div role="radiogroup" aria-labelledby="position-label" />
      </FormField>,
    )

    expect(screen.getByRole('radiogroup', { name: 'Posição' })).toBeInTheDocument()
    expect(screen.getByText('Escolha a posição')).toHaveAttribute('id', 'position-message')
  })
})
