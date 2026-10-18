import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router'
import { enumCodec, intCodec } from '@/lib/search-params'
import { useSearchParam } from './use-search-param'

const sortCodec = enumCodec(['name', 'cash'] as const, 'name')

function renderParams(route: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  )
  return renderHook(
    () => ({
      sort: useSearchParam('sort', sortCodec),
      club: useSearchParam('clube', intCodec({ min: 1 })),
      location: useLocation(),
    }),
    { wrapper },
  )
}

describe('useSearchParam', () => {
  it('deve ler o valor da URL com o codificador', () => {
    const { result } = renderParams('/clubes?sort=cash&clube=3')

    expect(result.current.sort[0]).toBe('cash')
    expect(result.current.club[0]).toBe(3)
  })

  it('deve voltar ao padrão quando a URL tem valor inválido', () => {
    const { result } = renderParams('/clubes?sort=xyz&clube=abc')

    expect(result.current.sort[0]).toBe('name')
    expect(result.current.club[0]).toBeUndefined()
  })

  it('deve escrever o valor preservando os outros parâmetros', () => {
    const { result } = renderParams('/clubes?clube=3&outro=x')

    act(() => result.current.sort[1]('cash'))

    expect(result.current.location.search).toBe('?clube=3&outro=x&sort=cash')
    expect(result.current.sort[0]).toBe('cash')
  })

  it('deve tirar o parâmetro da URL ao gravar o padrão ou undefined', () => {
    const { result } = renderParams('/clubes?sort=cash&clube=3')

    act(() => result.current.sort[1]('name'))
    expect(result.current.location.search).toBe('?clube=3')

    act(() => result.current.club[1](undefined))
    expect(result.current.location.search).toBe('')
  })
})
