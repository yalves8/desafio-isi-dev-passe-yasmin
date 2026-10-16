import { buildEditPlayerSchema, createPlayerSchema } from './player-form.validation'

const valid = {
  name: 'Davi  Melo',
  position: 'MEI' as const,
  age: '23',
  agility: '70',
  pace: '66',
  shooting: '62',
  passing: '74',
  dribbling: '70',
  defending: '48',
  physical: '58',
  potential: '82',
}

const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((i) => i.message) ?? []

describe('createPlayerSchema', () => {
  it('deve aceitar um jogador válido, normalizando o nome e convertendo números', () => {
    const result = createPlayerSchema.safeParse(valid)

    expect(result.success).toBe(true)
    expect(result.data).toMatchObject({ name: 'Davi Melo', age: 23, potential: 82 })
  })

  it.each([
    ['Da', 'Use de 3 a 100 caracteres.'],
    ['Davi 2 Melo', 'Use só letras, sem números.'],
    ['Davi', 'Informe nome e sobrenome.'],
  ])('deve recusar o nome "%s"', (name, message) => {
    expect(messages(createPlayerSchema.safeParse({ ...valid, name }))).toContain(message)
  })

  it('deve recusar idade e atributo fora dos limites, com a mensagem de cada campo', () => {
    const result = createPlayerSchema.safeParse({
      ...valid,
      age: '15',
      passing: '120',
      potential: '',
    })

    expect(messages(result)).toEqual(
      expect.arrayContaining([
        'Use uma idade de 16 a 45 anos.',
        'Use um valor de 1 a 99.',
        'Informe o potencial.',
      ]),
    )
  })

  it.each([
    ['-5', 'Use uma idade de 16 a 45 anos.'],
    ['-0', 'Use uma idade de 16 a 45 anos.'],
    ['16.5', 'Use um número inteiro.'],
    ['abc', 'Use um número inteiro.'],
  ])('deve tratar a idade "%s" com a mensagem certa', (age, message) => {
    expect(messages(createPlayerSchema.safeParse({ ...valid, age }))).toEqual([message])
  })

  it('deve limitar a agilidade a 85 com 35 anos ou mais', () => {
    const result = createPlayerSchema.safeParse({ ...valid, age: '35', agility: '86' })

    expect(messages(result)).toContain('Com 35 anos ou mais, a agilidade vai até 85.')
  })

  it('deve recusar soma dos atributos acima de 480', () => {
    const result = createPlayerSchema.safeParse({
      ...valid,
      pace: '90',
      shooting: '90',
      passing: '90',
      dribbling: '90',
      defending: '90',
      physical: '90',
      potential: '90',
    })

    expect(result.error?.issues[0]).toMatchObject({
      path: ['root', 'attributes'],
      message: 'A soma dos seis atributos é 540; o máximo é 480.',
    })
  })

  it('deve exigir potencial ≥ maior atributo e igual a ele com 33 anos ou mais', () => {
    expect(messages(createPlayerSchema.safeParse({ ...valid, potential: '70' }))).toContain(
      'Use pelo menos 74, o maior atributo.',
    )
    expect(
      messages(createPlayerSchema.safeParse({ ...valid, age: '33', potential: '82' })),
    ).toContain('Com 33 anos ou mais, use o maior atributo (74).')
  })
})

describe('buildEditPlayerSchema', () => {
  it('não deve deixar a idade diminuir', () => {
    const schema = buildEditPlayerSchema(30)
    const base = { name: 'Danilo Freitas', position: 'ZAG' as const, agility: '25' }

    expect(messages(schema.safeParse({ ...base, age: '29' }))).toContain(
      'A idade não pode diminuir (atual: 30).',
    )
    expect(schema.safeParse({ ...base, age: '30' }).success).toBe(true)
  })
})
