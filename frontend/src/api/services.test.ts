import { authService } from './auth.service'
import { api } from './client'
import { roomsService } from './rooms.service'
import { usersService } from './users.service'

describe('services da API', () => {
  const get = vi.spyOn(api, 'get').mockResolvedValue({ data: [] })
  const post = vi.spyOn(api, 'post').mockResolvedValue({ data: {} })
  const patch = vi.spyOn(api, 'patch').mockResolvedValue({ data: {} })

  it('deve enviar só os filtros preenchidos na listagem de salas', async () => {
    await roomsService.list({ name: 'lab', minCapacity: '', sort: 'capacity', order: 'desc' })
    expect(get).toHaveBeenCalledWith('/rooms', {
      params: { name: 'lab', sort: 'capacity', order: 'desc' },
    })
  })

  it('deve usar as rotas e métodos da API de salas', async () => {
    await roomsService.get(3)
    await roomsService.create({ name: 'Lab', capacity: 20 })
    await roomsService.update(3, { capacity: 25 })
    await roomsService.deactivate(3)

    expect(get).toHaveBeenCalledWith('/rooms/3')
    expect(post).toHaveBeenCalledWith('/rooms', { name: 'Lab', capacity: 20 })
    expect(patch).toHaveBeenCalledWith('/rooms/3', { capacity: 25 })
    expect(patch).toHaveBeenCalledWith('/rooms/3/deactivate')
  })

  it('deve usar as rotas da API de usuários e autenticação', async () => {
    const input = { name: 'Ana', email: 'ana@teste.com', password: 'Senha@123' }
    await usersService.list()
    await usersService.create({ ...input, role: 'USER' })
    await usersService.deactivate(5)
    await authService.login('ana@teste.com', 'Senha@123')
    await authService.register(input)
    await authService.me()

    expect(get).toHaveBeenCalledWith('/users')
    expect(post).toHaveBeenCalledWith('/users', { ...input, role: 'USER' })
    expect(patch).toHaveBeenCalledWith('/users/5/deactivate')
    expect(post).toHaveBeenCalledWith('/auth/login', {
      email: 'ana@teste.com',
      password: 'Senha@123',
    })
    expect(post).toHaveBeenCalledWith('/auth/register', input)
    expect(get).toHaveBeenCalledWith('/auth/me')
  })
})
