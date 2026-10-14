import { render, screen } from '@testing-library/react'
import { squadPlayerFixture } from '../../clubs.fixtures'
import { LineupPitch } from './lineup-pitch'

describe('LineupPitch', () => {
  it('deve mostrar os titulares pelo sobrenome e as vagas vazias pelo setor', () => {
    render(
      <LineupPitch
        rows={[
          {
            slot: { key: 'GOL-1', sector: 'GOL' },
            player: squadPlayerFixture({ condition: 'MAL_CONDICIONADO' }),
            candidates: [],
            attributes: [],
          },
          { slot: { key: 'MID-1', sector: 'MID' }, candidates: [], attributes: [] },
        ]}
      />,
    )

    expect(screen.getByRole('img', { name: 'Campo com 1 de 2 titulares' })).toBeInTheDocument()
    expect(screen.getByText('Tavares')).toBeInTheDocument()
    expect(screen.getByText('Meio')).toBeInTheDocument()
    expect(screen.getByTitle('Mal condicionado')).toBeInTheDocument()
  })
})
