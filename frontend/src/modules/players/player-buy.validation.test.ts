import {
  buildBuyPlayerSchema,
  defaultLoyaltyUntil,
  MAX_LOYALTY_DAYS,
  toLoyaltyUntil,
} from './player-buy.validation'

// 12/11/2026 15:00 em Brasília
const NOW = new Date('2026-11-12T15:00:00-03:00')
const schema = buildBuyPlayerSchema(() => NOW)

function errorsOf(input: { clubId: string; date: string; time: string }) {
  const result = schema.safeParse(input)
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message]))
}

describe('toLoyaltyUntil', () => {
  it('deve montar a data no formato da RN01, com o fuso de Brasília', () => {
    expect(toLoyaltyUntil('2027-03-02', '10:15')).toBe('2027-03-02T10:15-03:00')
  })
})

describe('defaultLoyaltyUntil', () => {
  it('deve sugerir um ano depois de agora, no horário de Brasília', () => {
    expect(defaultLoyaltyUntil(NOW)).toEqual({ date: '2027-11-12', time: '15:00' })
  })

  it('deve trocar 29/02 por 28/02 quando o ano seguinte não é bissexto', () => {
    expect(defaultLoyaltyUntil(new Date('2028-02-29T09:30:00-03:00'))).toEqual({
      date: '2029-02-28',
      time: '09:30',
    })
  })
})

describe('buildBuyPlayerSchema', () => {
  it('deve devolver o corpo da API com club_id numérico e loyalty_until com -03:00', () => {
    expect(schema.parse({ clubId: '6', date: '2027-11-12', time: '15:00' })).toEqual({
      club_id: 6,
      loyalty_until: '2027-11-12T15:00-03:00',
    })
  })

  it('deve exigir o clube, a data e a hora', () => {
    expect(errorsOf({ clubId: '', date: '', time: '' })).toEqual({
      clubId: 'Escolha o clube comprador.',
      date: 'Informe a data.',
      time: 'Informe a hora.',
    })
  })

  it('deve recusar fim da fidelidade que não é depois de agora', () => {
    expect(errorsOf({ clubId: '1', date: '2026-11-12', time: '15:00' })).toEqual({
      date: 'O fim da fidelidade precisa ser depois de agora.',
    })
  })

  it(`deve aceitar até ${MAX_LOYALTY_DAYS} dias depois de agora e recusar além disso`, () => {
    // 1.095 dias depois de 12/11/2026 15:00 é 11/11/2029 15:00 (2028 é bissexto)
    expect(errorsOf({ clubId: '1', date: '2029-11-11', time: '15:00' })).toEqual({})
    expect(errorsOf({ clubId: '1', date: '2029-11-11', time: '15:01' })).toEqual({
      date: 'No máximo 1.095 dias depois de agora.',
    })
  })

  it('deve recusar data inexistente em vez de ajustá-la', () => {
    expect(errorsOf({ clubId: '1', date: '2027-02-30', time: '10:15' })).toEqual({
      date: 'Data ou hora inválida.',
    })
  })
})
