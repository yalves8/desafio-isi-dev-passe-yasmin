import { squadPlayerFixture as player } from '../../clubs.fixtures'
import {
  assignPlayers,
  buildRows,
  buildSlots,
  canAnyFormationClose,
  joinNames,
} from './lineup-editor.utils'

const goalkeeper = player({ id: 1, name: 'Bruno Tavares', position: 'GOL' })
const centerBack = player({ id: 2, name: 'Felipe Moura', position: 'ZAG' })
const fullBack = player({ id: 3, name: 'Diego Ramos', position: 'LAT' })
const midfielder = player({ id: 4, name: 'Sávio Lima', position: 'MEI' })
const striker = player({ id: 5, name: 'João Silva', position: 'ATA' })
const sick = player({ id: 6, name: 'Lucas Ferraz', position: 'MEI', condition: 'DOENTE' })
const squad = [goalkeeper, centerBack, fullBack, midfielder, striker, sick]

describe('buildSlots', () => {
  it('deve criar o goleiro e as vagas de cada setor da formação', () => {
    expect(buildSlots('2-1-1').map((s) => s.key)).toEqual([
      'GK-1',
      'DEF-1',
      'DEF-2',
      'MID-1',
      'ATT-1',
    ])
    expect(buildSlots('3-1').map((s) => s.sector)).toEqual(['GK', 'DEF', 'DEF', 'DEF', 'ATT'])
  })
})

describe('assignPlayers', () => {
  it('deve encaixar os titulares no setor de cada um, na ordem recebida da API', () => {
    expect(assignPlayers('2-1-1', [goalkeeper, centerBack, fullBack, midfielder, striker])).toEqual(
      {
        'GK-1': 1,
        'DEF-1': 2,
        'DEF-2': 3,
        'MID-1': 4,
        'ATT-1': 5,
      },
    )
  })

  it('deve deixar vazia a vaga sem jogador do setor', () => {
    expect(assignPlayers('2-1-1', [goalkeeper, striker])['MID-1']).toBeUndefined()
  })

  it('deve deixar vazias as primeiras vagas de um setor incompleto', () => {
    const selection = assignPlayers('2-1-1', [goalkeeper, fullBack, midfielder, striker])

    expect(selection['DEF-1']).toBeUndefined()
    expect(selection['DEF-2']).toBe(3)
  })
})

describe('buildRows', () => {
  it('não deve oferecer jogador DOENTE nem quem já está em outra vaga', () => {
    const rows = buildRows('1-2-1', { 'GK-1': 1, 'DEF-1': 2, 'MID-1': 4 }, squad)
    const secondMid = rows.find((r) => r.slot.key === 'MID-2')!

    expect(secondMid.candidates).toEqual([])
    expect(rows.find((r) => r.slot.key === 'MID-1')!.candidates).toEqual([midfielder])
  })

  it('deve oferecer os candidatos na ordem do elenco devolvida pela API, sem reordenar', () => {
    const second = player({ id: 7, name: 'Abel Costa', position: 'ZAG' })
    const rows = buildRows('2-1-1', {}, [goalkeeper, centerBack, second])

    expect(rows.find((r) => r.slot.key === 'DEF-1')!.candidates).toEqual([centerBack, second])
  })

  it('deve pedir o titular só nas vagas vazias, depois de tentar salvar', () => {
    const selection = { 'GK-1': 1, 'DEF-1': 2, 'DEF-2': 3, 'MID-1': 4 }

    expect(buildRows('2-1-1', selection, squad).every((r) => !r.error)).toBe(true)
    const rows = buildRows('2-1-1', selection, squad, true)
    expect(rows.filter((r) => r.error).map((r) => [r.slot.key, r.error])).toEqual([
      ['ATT-1', 'Escolha o titular.'],
    ])
  })
})

describe('canAnyFormationClose', () => {
  it('deve dizer se os jogadores disponíveis fecham alguma formação', () => {
    expect(canAnyFormationClose(squad)).toBe(true)
    expect(canAnyFormationClose([goalkeeper, centerBack, fullBack, sick])).toBe(false)
    expect(canAnyFormationClose([centerBack, fullBack, midfielder, striker])).toBe(false)
  })
})

describe('joinNames', () => {
  it('deve juntar nomes em português', () => {
    expect(joinNames(['Ana'])).toBe('Ana')
    expect(joinNames(['Ana', 'Bia', 'Caio'])).toBe('Ana, Bia e Caio')
  })
})
