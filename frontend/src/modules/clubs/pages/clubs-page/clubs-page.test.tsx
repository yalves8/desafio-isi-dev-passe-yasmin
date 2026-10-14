import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { clubsService } from '@/api/clubs.service'
import { renderPage } from '@/test/render'
import { clubFixture } from '../../clubs.fixtures'
import { ClubsPage } from './clubs-page'
import { parseClubSort } from './clubs-page.utils'

vi.mock('@/api/clubs.service', () => ({ clubsService: { list: vi.fn(), create: vi.fn() } }))

function renderClubs(route = '/clubes') {
  return renderPage(<ClubsPage />, { route, path: '/clubes' })
}

describe('ClubsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clubsService.list).mockResolvedValue([clubFixture()])
  })

  it('deve listar os clubes ordenados como pede a URL', async () => {
    renderClubs('/clubes?sort=net_worth_desc')

    expect(await screen.findByText('Águias FC')).toBeInTheDocument()
    expect(clubsService.list).toHaveBeenCalledWith('net_worth_desc')
    expect(screen.getByText('1 de 20')).toBeInTheDocument()
  })

  it('deve abrir o "Novo clube" pela URL e pelo botão', async () => {
    const user = userEvent.setup()
    renderClubs('/clubes?novo=1')

    expect(await screen.findByRole('dialog', { name: 'Novo clube' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /novo clube/i }))
    expect(screen.getByRole('dialog', { name: 'Novo clube' })).toBeInTheDocument()
  })

  it('deve bloquear a criação quando a liga já tem 20 clubes', async () => {
    vi.mocked(clubsService.list).mockResolvedValue(
      Array.from({ length: 20 }, (_, i) => clubFixture({ id: i + 1, name: `Clube ${i}` })),
    )
    renderClubs()

    expect(await screen.findByText('20 de 20')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /novo clube/i })).toBeDisabled()
  })
})

describe('parseClubSort', () => {
  it('deve voltar para "name" com valor inválido', () => {
    expect(parseClubSort('net_worth_asc')).toBe('net_worth_asc')
    expect(parseClubSort('xyz')).toBe('name')
    expect(parseClubSort(null)).toBe('name')
  })
})
