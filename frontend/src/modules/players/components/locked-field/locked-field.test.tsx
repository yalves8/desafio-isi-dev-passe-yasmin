import { render, screen } from '@testing-library/react'
import { LockedField } from './locked-field'

describe('LockedField', () => {
  it('deve indicar que o valor é calculado depois de salvar', () => {
    render(<LockedField label="Overall" hint="Calculado automaticamente" />)

    expect(screen.getByText('Overall')).toBeInTheDocument()
    expect(screen.getByText('Após salvar')).toBeInTheDocument()
  })
})
