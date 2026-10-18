import { enumCodec, flagCodec, intCodec, numberCodec } from './search-params'

describe('enumCodec', () => {
  const sort = enumCodec(['name', 'cash'] as const, 'name')

  it('deve aceitar só os valores permitidos e voltar ao padrão', () => {
    expect(sort.parse('cash')).toBe('cash')
    expect(sort.parse('xyz')).toBe('name')
    expect(sort.parse(null)).toBe('name')
  })

  it('deve omitir o padrão da URL', () => {
    expect(sort.format('cash')).toBe('cash')
    expect(sort.format('name')).toBeUndefined()
  })

  it('sem padrão, deve devolver undefined para valor ausente ou inválido', () => {
    const position = enumCodec(['GOL', 'ATA'] as const)
    expect(position.parse('GOL')).toBe('GOL')
    expect(position.parse('xyz')).toBeUndefined()
    expect(position.format('ATA')).toBe('ATA')
    expect(position.format(undefined)).toBeUndefined()
  })
})

describe('numberCodec', () => {
  const codec = numberCodec()

  it('deve ler números finitos, inclusive decimais', () => {
    expect(codec.parse('12.5')).toBe(12.5)
    expect(codec.parse('0')).toBe(0)
    expect(codec.parse('')).toBeUndefined()
    expect(codec.parse('  ')).toBeUndefined()
    expect(codec.parse('abc')).toBeUndefined()
    expect(codec.parse('Infinity')).toBeUndefined()
    expect(codec.parse(null)).toBeUndefined()
  })

  it('deve escrever o número ou omitir', () => {
    expect(codec.format(12.5)).toBe('12.5')
    expect(codec.format(undefined)).toBeUndefined()
  })
})

describe('intCodec', () => {
  it('deve aceitar só inteiros a partir do mínimo', () => {
    const id = intCodec({ min: 1 })
    expect(id.parse('3')).toBe(3)
    expect(id.parse('0')).toBeUndefined()
    expect(id.parse('-2')).toBeUndefined()
    expect(id.parse('1.5')).toBeUndefined()
    expect(id.parse('abc')).toBeUndefined()
    expect(id.parse(null)).toBeUndefined()
    expect(id.format(3)).toBe('3')
    expect(id.format(undefined)).toBeUndefined()
  })

  it('sem mínimo, deve aceitar qualquer inteiro', () => {
    expect(intCodec().parse('-2')).toBe(-2)
  })
})

describe('flagCodec', () => {
  it('deve ler "1" como ligado e omitir quando desligado', () => {
    expect(flagCodec.parse('1')).toBe(true)
    expect(flagCodec.parse('0')).toBe(false)
    expect(flagCodec.parse(null)).toBe(false)
    expect(flagCodec.format(true)).toBe('1')
    expect(flagCodec.format(false)).toBeUndefined()
  })
})
