import {
  formatDate,
  formatDateTime,
  formatInteger,
  formatMoney,
  formatSigned,
  signedTone,
  formatTime,
  getInitials,
  normalizeText,
} from './format'

describe('format', () => {
  it('deve formatar data e hora no horário de Brasília', () => {
    expect(formatDate('2028-11-03T11:20:00-03:00')).toBe('03/11/2028')
    expect(formatTime('2028-11-03T14:20:00Z')).toBe('11:20')
    expect(formatDateTime('2028-11-03T11:20:00-03:00')).toBe('03/11/2028 11:20')
  })

  it('deve formatar moedas com 2 casas e inteiros com milhar', () => {
    expect(formatMoney(1234.5)).toBe('1.234,50')
    expect(formatMoney(-38.85)).toBe('-38,85')
    expect(formatInteger(1089)).toBe('1.089')
  })

  it('deve formatar valores com sinal, sem sinal no zero', () => {
    expect(formatSigned(3)).toBe('+3,00')
    expect(formatSigned(-5.7)).toBe('-5,70')
    expect(formatSigned(0)).toBe('0,00')
  })

  it('deve gerar iniciais e normalizar texto', () => {
    expect(getInitials('Ênio Carvalho')).toBe('ÊC')
    expect(normalizeText('Águias FC')).toBe('aguias fc')
  })

  it('deve dar verde à entrada, vermelho à saída e a cor pedida ao zero', () => {
    expect(signedTone(3)).toBe('text-green-700')
    expect(signedTone(-0.5)).toBe('text-red-600')
    expect(signedTone(0)).toBeUndefined()
    expect(signedTone(0, 'text-muted-foreground')).toBe('text-muted-foreground')
  })
})
