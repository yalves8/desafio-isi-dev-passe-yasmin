import { render, screen } from '@testing-library/react'
import { FieldMessage } from './field-message'

describe('FieldMessage', () => {
  it('deve trocar a dica pela mensagem de erro', () => {
    const { rerender, container } = render(<FieldMessage id="age" hint="De 16 a 45 anos." />)
    expect(screen.getByText('De 16 a 45 anos.')).toHaveAttribute('id', 'age-message')

    rerender(<FieldMessage id="age" hint="De 16 a 45 anos." error="Informe a idade" />)
    expect(screen.queryByText('De 16 a 45 anos.')).not.toBeInTheDocument()
    expect(screen.getByText('Informe a idade')).toHaveAttribute('id', 'age-message')

    rerender(<FieldMessage id="age" />)
    expect(container).toBeEmptyDOMElement()
  })
})
