import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { roomsService } from '@/api/rooms.service'
import { adminUser, renderPage } from '@/test/render'
import { RoomFormPage } from './room-form-page'

vi.mock('@/api/rooms.service', () => ({
  roomsService: { create: vi.fn(), get: vi.fn(), update: vi.fn() },
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const auth = { user: adminUser, isAdmin: true }

describe('RoomFormPage', () => {
  it('deve validar os campos antes de enviar', async () => {
    renderPage(<RoomFormPage />, { auth })

    await userEvent.type(screen.getByLabelText('Capacidade'), '0')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar sala' }))

    expect(await screen.findByText('Informe o nome (mínimo 2 caracteres)')).toBeInTheDocument()
    expect(screen.getByText('A capacidade deve ser maior que zero')).toBeInTheDocument()
    expect(roomsService.create).not.toHaveBeenCalled()
  })

  it('deve cadastrar e voltar para a listagem', async () => {
    vi.mocked(roomsService.create).mockResolvedValue({} as never)
    renderPage(<RoomFormPage />, { auth })

    await userEvent.type(screen.getByLabelText('Nome'), 'Laboratório 2')
    await userEvent.type(screen.getByLabelText('Capacidade'), '24')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar sala' }))

    expect(await screen.findByText('tela de salas')).toBeInTheDocument()
    expect(roomsService.create).toHaveBeenCalledWith({ name: 'Laboratório 2', capacity: 24 })
  })
})
