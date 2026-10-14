import { screen } from '@testing-library/react'
import { roomsService } from '@/api/rooms.service'
import { adminUser, renderPage } from '@/test/render'
import { RoomsPage } from './rooms-page'

vi.mock('@/api/rooms.service', () => ({ roomsService: { list: vi.fn(), deactivate: vi.fn() } }))

const room = {
  id: 1,
  name: 'Sala 101',
  capacity: 10,
  active: true,
  createdAt: '2026-10-01T12:00:00Z',
  updatedAt: '2026-10-01T12:00:00Z',
}

describe('RoomsPage', () => {
  it('deve mostrar o estado vazio quando não houver salas', async () => {
    vi.mocked(roomsService.list).mockResolvedValue([])
    renderPage(<RoomsPage />)

    expect(await screen.findByText('Nenhuma sala cadastrada')).toBeInTheDocument()
  })

  it('deve oferecer limpar filtros quando a busca não encontrar nada', async () => {
    vi.mocked(roomsService.list).mockResolvedValue([])
    renderPage(<RoomsPage />, { route: '/?name=xyz' })

    expect(await screen.findByText('Nenhuma sala encontrada')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument()
  })

  it('deve esconder ações de admin para usuário comum', async () => {
    vi.mocked(roomsService.list).mockResolvedValue([room])
    renderPage(<RoomsPage />)

    expect(await screen.findAllByText('Sala 101')).not.toHaveLength(0)
    expect(screen.queryByRole('link', { name: /nova sala/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /inativar/i })).not.toBeInTheDocument()
  })

  it('deve mostrar ações de admin para administrador', async () => {
    vi.mocked(roomsService.list).mockResolvedValue([room])
    renderPage(<RoomsPage />, { auth: { user: adminUser, isAdmin: true } })

    expect(await screen.findByRole('link', { name: /nova sala/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Inativar Sala 101' })).not.toHaveLength(0)
  })

  it('deve mostrar erro com opção de tentar novamente', async () => {
    vi.mocked(roomsService.list).mockRejectedValue(new Error('falha'))
    renderPage(<RoomsPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro inesperado')
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })
})
