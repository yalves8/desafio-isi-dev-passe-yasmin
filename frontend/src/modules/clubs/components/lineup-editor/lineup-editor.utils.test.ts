import { squadPlayerFixture as player } from '../../clubs.fixtures'
import {
  assignPlayers,
  buildRows,
  buildSlots,
  canAnyFormationClose,
  joinNames,
  lineOrders,
  usedAttributes,
} from './lineup-editor.utils'

const gol = player({ id: 1, name: 'Bruno Tavares', position: 'GOL', defending: 77 })
const zag = player({ id: 2, name: 'Felipe Moura', position: 'ZAG', defending: 83 })
const lat = player({ id: 3, name: 'Diego Ramos', position: 'LAT', dribbling: 74, defending: 66 })
const mei = player({ id: 4, name: 'Sávio Lima', position: 'MEI', passing: 70 })
const ata = player({ id: 5, name: 'João Silva', position: 'ATA', shooting: 79 })
const sick = player({ id: 6, name: 'Lucas Ferraz', position: 'MEI', condition: 'DOENTE' })
const squad = [gol, zag, lat, mei, ata, sick]

describe('buildSlots', () => {
  it('deve criar o goleiro e as vagas de cada setor da formação', () => {
    expect(buildSlots('2-1-1').map((s) => s.key)).toEqual([
      'GOL-1',
      'DEF-1',
      'DEF-2',
      'MID-1',
      'ATT-1',
    ])
    expect(buildSlots('3-1').map((s) => s.sector)).toEqual(['GOL', 'DEF', 'DEF', 'DEF', 'ATT'])
  })
})

describe('assignPlayers', () => {
  it('deve encaixar os titulares salvos na ordem do elenco', () => {
    expect(assignPlayers('2-1-1', [ata, mei, lat, zag, gol])).toEqual({
      'GOL-1': 1,
      'DEF-1': 2,
      'DEF-2': 3,
      'MID-1': 4,
      'ATT-1': 5,
    })
  })

  it('deve deixar vazia a vaga sem jogador do setor', () => {
    expect(assignPlayers('2-1-1', [gol, ata])['MID-1']).toBeUndefined()
  })

  it('deve deixar vazias as primeiras vagas de um setor incompleto', () => {
    const selection = assignPlayers('2-1-1', [gol, lat, mei, ata])

    expect(selection['DEF-1']).toBeUndefined()
    expect(selection['DEF-2']).toBe(3)
  })
})

describe('usedAttributes e lineOrders (RN20)', () => {
  it('deve numerar os jogadores de linha de trás para frente', () => {
    expect(lineOrders('2-1-1', [gol, zag, lat, mei, ata])).toEqual(
      new Map([
        [2, 1],
        [3, 2],
        [4, 3],
        [5, 4],
      ]),
    )
  })

  it('deve contar a vaga vazia, mantendo o papel de quem ficou', () => {
    expect(lineOrders('2-1-1', [gol, lat, mei, ata]).get(3)).toBe(2)
  })

  it('deve usar a defesa do goleiro e do 1º jogador de linha', () => {
    expect(usedAttributes(gol, 0)).toEqual([{ label: 'Defesa', value: 77 }])
    expect(usedAttributes(zag, 1)).toEqual([{ label: 'Defesa', value: 83 }])
  })

  it('deve usar ataque e defesa do 2º e só o ataque do 3º e do 4º', () => {
    expect(usedAttributes(lat, 2)).toEqual([
      { label: 'Drible', value: 74 },
      { label: 'Defesa', value: 66 },
    ])
    expect(usedAttributes(mei, 3)).toEqual([{ label: 'Passe', value: 70 }])
    expect(usedAttributes(ata, 4)).toEqual([{ label: 'Finalização', value: 79 }])
  })
})

describe('buildRows', () => {
  it('não deve oferecer jogador DOENTE nem quem já está em outra vaga', () => {
    const rows = buildRows('1-2-1', { 'GOL-1': 1, 'DEF-1': 2, 'MID-1': 4 }, squad)
    const secondMid = rows.find((r) => r.slot.key === 'MID-2')!

    expect(secondMid.candidates).toEqual([])
    expect(rows.find((r) => r.slot.key === 'MID-1')!.candidates).toEqual([mei])
  })
})

describe('canAnyFormationClose', () => {
  it('deve dizer se os jogadores disponíveis fecham alguma formação', () => {
    expect(canAnyFormationClose(squad)).toBe(true)
    expect(canAnyFormationClose([gol, zag, lat, sick])).toBe(false)
    expect(canAnyFormationClose([zag, lat, mei, ata])).toBe(false)
  })
})

describe('joinNames', () => {
  it('deve juntar nomes em português', () => {
    expect(joinNames(['Ana'])).toBe('Ana')
    expect(joinNames(['Ana', 'Bia', 'Caio'])).toBe('Ana, Bia e Caio')
  })
})
