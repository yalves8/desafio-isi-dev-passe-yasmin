import { parseRangeValue, validateRange } from './range-filter.hook'

describe('parseRangeValue', () => {
  it('deve aceitar vírgula ou ponto decimal e tratar vazio como sem limite', () => {
    expect(parseRangeValue('10,5')).toBe(10.5)
    expect(parseRangeValue('10.5')).toBe(10.5)
    expect(parseRangeValue('  ')).toBeUndefined()
    expect(parseRangeValue('abc')).toBeNaN()
  })
})

describe('validateRange', () => {
  const age = { min: 16, max: 45 }
  const value = { min: 0, max: 550 }

  it('deve aceitar faixas dentro dos limites, inclusive abertas', () => {
    expect(validateRange(18, 30, age, 0)).toBeNull()
    expect(validateRange(undefined, 30, age, 0)).toBeNull()
    expect(validateRange(10.25, 60, value, 2)).toBeNull()
  })

  it('deve recusar valores fora dos limites ou com casas a mais', () => {
    expect(validateRange(15, 30, age, 0)).toBe('Use números inteiros de 16 a 45.')
    expect(validateRange(18.5, 30, age, 0)).toBe('Use números inteiros de 16 a 45.')
    expect(validateRange(10.123, 60, value, 2)).toBe(
      'Use valores de 0,00 a 550,00, com até 2 casas.',
    )
  })

  it('deve recusar mínimo maior que o máximo', () => {
    expect(validateRange(30, 18, age, 0)).toBe('O mínimo não pode passar do máximo.')
  })
})
