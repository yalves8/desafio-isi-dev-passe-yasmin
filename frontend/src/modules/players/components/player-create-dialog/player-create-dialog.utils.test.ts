import { getAttributesPreview } from './player-create-dialog.utils'

const attributes = {
  pace: '66',
  shooting: '62',
  passing: '74',
  dribbling: '70',
  defending: '48',
  physical: '58',
}

describe('getAttributesPreview', () => {
  it('deve esperar os seis atributos', () => {
    expect(getAttributesPreview({ pace: '66' })).toEqual({ status: 'empty' })
  })

  it('deve ficar inválida com valor fora de 1 a 99', () => {
    expect(getAttributesPreview({ ...attributes, passing: '120' })).toEqual({ status: 'invalid' })
  })

  it('deve montar os itens com o potencial quando informado', () => {
    const preview = getAttributesPreview({ ...attributes, potential: '82' })

    expect(preview).toMatchObject({ status: 'ready', potential: 82 })
    expect(preview.status === 'ready' && preview.items[2]).toEqual({ label: 'Passe', value: 74 })
  })
})
