import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { clubsService } from '@/api/clubs.service'
import type { Club } from '@/api/types'
import { LeagueDataContext } from '@/contexts/league-data-context'
import { useLeagueClubs } from './use-league-clubs'

vi.mock('@/api/clubs.service', () => ({ clubsService: { list: vi.fn() } }))

const clubs = [
  { id: 1, name: 'Águias FC' },
  { id: 2, name: 'Tubarões EC' },
] as Club[]

function withVersion(version: number) {
  return ({ children }: { children: ReactNode }) => (
    <LeagueDataContext.Provider value={{ version, refresh: vi.fn() }}>
      {children}
    </LeagueDataContext.Provider>
  )
}

describe('useLeagueClubs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve buscar os clubes por nome e indexá-los por id', async () => {
    vi.mocked(clubsService.list).mockResolvedValue(clubs)
    const { result } = renderHook(() => useLeagueClubs(), { wrapper: withVersion(0) })

    expect(result.current.list).toEqual([])
    expect(result.current.byId.size).toBe(0)
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(clubsService.list).toHaveBeenCalledWith('name')
    expect(result.current.data).toBe(clubs)
    expect(result.current.list).toBe(clubs)
    expect(result.current.byId.get(2)?.name).toBe('Tubarões EC')
  })

  it('deve manter a lista anterior enquanto recarrega após uma mudança na liga', async () => {
    vi.mocked(clubsService.list)
      .mockResolvedValueOnce(clubs)
      .mockReturnValueOnce(new Promise(() => {}))
    let version = 0
    const { result, rerender } = renderHook(() => useLeagueClubs(), {
      wrapper: ({ children }) => withVersion(version)({ children }),
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    version = 1
    rerender()

    expect(result.current.loading).toBe(true)
    expect(result.current.list).toBe(clubs)
    expect(clubsService.list).toHaveBeenCalledTimes(2)
  })

  it('deve devolver o erro da busca com a lista vazia', async () => {
    vi.mocked(clubsService.list).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useLeagueClubs(), { wrapper: withVersion(0) })

    await waitFor(() => expect(result.current.error).toBe('Erro inesperado. Tente novamente.'))
    expect(result.current.list).toEqual([])
  })
})
