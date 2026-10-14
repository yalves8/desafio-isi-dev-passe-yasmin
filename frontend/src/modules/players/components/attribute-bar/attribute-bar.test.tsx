import { render, screen } from '@testing-library/react'
import { AttributeBar } from './attribute-bar'

describe('AttributeBar', () => {
  it('deve mostrar o rótulo e o valor do atributo', () => {
    render(
      <ul>
        <AttributeBar label="Passe" value={84} potential={86} />
      </ul>,
    )

    expect(screen.getByRole('listitem')).toHaveTextContent('Passe84')
  })
})
