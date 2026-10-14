import { createClubSchema, isAcronymInName } from './club-form.validation'

const messages = (input: { name: string; acronym: string }) =>
  createClubSchema.safeParse(input).error?.issues.map((i) => i.message) ?? []

describe('createClubSchema', () => {
  it('deve aceitar nome e sigla válidos, normalizando os espaços', () => {
    const result = createClubSchema.safeParse({ name: '  Leões   da Serra ', acronym: 'LDS' })

    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Leões da Serra')
  })

  it.each([
    ['Ab', 'Use de 3 a 60 caracteres.'],
    ['Clube 2000', 'Use só letras, espaços, hífen e ponto.'],
    ['Flamengo', 'Use de 2 a 5 palavras.'],
    ['Um Dois Tres Quatro Cinco Seis', 'Use de 2 a 5 palavras.'],
  ])('deve recusar o nome "%s"', (name, message) => {
    expect(messages({ name, acronym: 'XYZ' })).toContain(message)
  })

  it.each([
    ['lds', 'Use 3 letras de A a Z, maiúsculas e sem acento.'],
    ['LLL', 'As três letras não podem ser iguais.'],
    ['DSL', 'A primeira letra precisa ser a primeira do nome (L).'],
    ['LRD', 'As 3 letras precisam aparecer no nome, nessa ordem.'],
  ])('deve recusar a sigla "%s" para "Leões da Serra"', (acronym, message) => {
    expect(messages({ name: 'Leões da Serra', acronym })).toContain(message)
  })
})

describe('isAcronymInName', () => {
  it('deve ignorar acentos e maiúsculas', () => {
    expect(isAcronymInName('AGU', 'Águias FC')).toBe(true)
    expect(isAcronymInName('ÉPS', 'Épsilon EC')).toBe(false)
  })
})
