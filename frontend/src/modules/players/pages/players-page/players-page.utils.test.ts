import {
  clearFilter,
  DEFAULT_PARAMS,
  formatRange,
  getFilterChips,
  getPageNumbers,
  paginationSummary,
  parsePlayersParams,
  toApiFilters,
  toSearchParams,
} from './players-page.utils'

const clubs = [{ id: 2, name: 'Delta FC', acronym: 'DEL', cash: 0, squad_value: 0, net_worth: 0 }]

describe('parsePlayersParams', () => {
  it('deve usar os valores padrão quando a URL está vazia', () => {
    expect(parsePlayersParams(new URLSearchParams())).toEqual(DEFAULT_PARAMS)
  })

  it('deve ignorar valores inválidos editados à mão na URL', () => {
    const params = parsePlayersParams(
      new URLSearchParams('position=XYZ&condition=OK&tab=foo&sort=bar&page=-3&min_age=abc'),
    )

    expect(params).toEqual(DEFAULT_PARAMS)
  })

  it('deve ler filtros, aba, ordenação e página válidos', () => {
    const params = parsePlayersParams(
      new URLSearchParams(
        'search=joao&position=MEI&club=2&min_value=10.5&tab=clubs&sort=age_asc&page=2',
      ),
    )

    expect(params).toMatchObject({
      search: 'joao',
      position: 'MEI',
      clubId: 2,
      minValue: 10.5,
      tab: 'clubs',
      sort: 'age_asc',
      page: 2,
    })
  })
})

describe('toSearchParams', () => {
  it('deve omitir os valores padrão para a URL ficar curta', () => {
    expect(toSearchParams(DEFAULT_PARAMS).toString()).toBe('')
  })

  it('deve ida e volta preservar o estado', () => {
    const params = { ...DEFAULT_PARAMS, condition: 'DOENTE' as const, maxAge: 30, page: 3 }

    expect(parsePlayersParams(toSearchParams(params))).toEqual(params)
  })
})

describe('toApiFilters', () => {
  it('deve converter a aba em free e paginar de 10 em 10', () => {
    expect(toApiFilters({ ...DEFAULT_PARAMS, tab: 'free' })).toMatchObject({
      free: true,
      limit: 10,
    })
    expect(toApiFilters({ ...DEFAULT_PARAMS, tab: 'clubs' })).toMatchObject({ free: false })
    expect(toApiFilters(DEFAULT_PARAMS).free).toBeUndefined()
  })

  it('não deve combinar "Livres" com o filtro por clube (a API recusa com 400)', () => {
    expect(toApiFilters({ ...DEFAULT_PARAMS, tab: 'free', clubId: 2 }).club_id).toBeUndefined()
  })

  it('deve ignorar busca com menos de 2 caracteres', () => {
    expect(toApiFilters({ ...DEFAULT_PARAMS, search: ' j ' }).search).toBeUndefined()
    expect(toApiFilters({ ...DEFAULT_PARAMS, search: ' jo ' }).search).toBe('jo')
  })
})

describe('getFilterChips', () => {
  it('deve montar um chip por filtro ativo, com valores em moedas formatados', () => {
    const chips = getFilterChips(
      {
        ...DEFAULT_PARAMS,
        condition: 'MAL_CONDICIONADO',
        clubId: 2,
        minAge: 18,
        maxAge: 30,
        minValue: 10,
        maxValue: 60,
      },
      clubs,
    )

    expect(chips.map((c) => c.label)).toEqual([
      'Condição: Mal condicionado',
      'Clube: Delta FC',
      'Idade: 18 a 30',
      'Valor de mercado: 10,00 a 60,00',
    ])
  })

  it('deve limpar os dois lados de uma faixa ao remover o chip', () => {
    expect(clearFilter('age')).toEqual({ minAge: undefined, maxAge: undefined })
  })
})

describe('formatRange', () => {
  it('deve descrever faixas abertas', () => {
    expect(formatRange(18, undefined)).toBe('a partir de 18')
    expect(formatRange(undefined, 30)).toBe('até 30')
  })
})

describe('paginação', () => {
  it('deve mostrar até 5 páginas ao redor da atual', () => {
    expect(getPageNumbers(1, 3)).toEqual([1, 2, 3])
    expect(getPageNumbers(6, 10)).toEqual([4, 5, 6, 7, 8])
    expect(getPageNumbers(10, 10)).toEqual([6, 7, 8, 9, 10])
  })

  it('deve resumir o intervalo exibido', () => {
    expect(paginationSummary(3, 23)).toBe('Mostrando 21–23 de 23 jogadores')
    expect(paginationSummary(1, 1)).toBe('Mostrando 1–1 de 1 jogador')
  })
})
