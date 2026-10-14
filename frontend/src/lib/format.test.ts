import {
  formatDate,
  formatInteger,
  formatMoney,
  formatTime,
  getInitials,
  normalizeText,
} from './format'

describe('format', () => {
  it('deve formatar data e hora no horário de Brasília', () => {
    expect(formatDate('2028-11-03T11:20:00-03:00')).toBe('03/11/2028')
    expect(formatTime('2028-11-03T14:20:00Z')).toBe('11:20')
  })

  it('deve formatar moedas com 2 casas e inteiros com milhar', () => {
    expect(formatMoney(1234.5)).toBe('1.234,50')
    expect(formatMoney(-38.85)).toBe('-38,85')
    expect(formatInteger(1089)).toBe('1.089')
  })

  it('deve gerar iniciais e normalizar texto', () => {
    expect(getInitials('Ênio Carvalho')).toBe('ÊC')
    expect(normalizeText('Águias FC')).toBe('aguias fc')
  })
})
