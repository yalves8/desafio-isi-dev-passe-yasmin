import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { clubsService } from '@/api/clubs.service'
import { clubFixture } from '../../clubs.fixtures'
import { ClubCreateDialog } from './club-create-dialog'

vi.mock('@/api/clubs.service', () => ({ clubsService: { create: vi.fn() } }))

function conflict(message: string) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError(
    'Conflict',
    '409',
    config,
    {},
    {
      status: 409,
      statusText: 'Conflict',
      data: { message },
      headers: {},
      config,
    },
  )
}

describe('ClubCreateDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve validar nome e sigla antes de enviar', async () => {
    const user = userEvent.setup()
    render(<ClubCreateDialog onClose={vi.fn()} onCreated={vi.fn()} />)

    await user.type(screen.getByLabelText('Nome'), 'Leões da Serra')
    await user.type(screen.getByLabelText('Sigla'), 'dsl')
    await user.click(screen.getByRole('button', { name: 'Criar clube' }))

    expect(screen.getByLabelText('Sigla')).toHaveValue('DSL')
    expect(
      await screen.findByText('A primeira letra precisa ser a primeira do nome (L).'),
    ).toBeInTheDocument()
    expect(clubsService.create).not.toHaveBeenCalled()
  })

  it('deve criar o clube e devolver o que a API respondeu', async () => {
    const user = userEvent.setup()
    const created = clubFixture({ id: 7, name: 'Leões da Serra', acronym: 'LDS' })
    vi.mocked(clubsService.create).mockResolvedValue(created)
    const onCreated = vi.fn()
    render(<ClubCreateDialog onClose={vi.fn()} onCreated={onCreated} />)

    await user.type(screen.getByLabelText('Nome'), 'Leões  da Serra')
    await user.type(screen.getByLabelText('Sigla'), 'LDS')
    await user.click(screen.getByRole('button', { name: 'Criar clube' }))

    expect(clubsService.create).toHaveBeenCalledWith({ name: 'Leões da Serra', acronym: 'LDS' })
    expect(onCreated).toHaveBeenCalledWith(created)
  })

  it('deve mostrar no diálogo o conflito devolvido pela API', async () => {
    const user = userEvent.setup()
    vi.mocked(clubsService.create).mockRejectedValue(
      conflict('Já existe um clube com o nome “Águias FC”.'),
    )
    render(<ClubCreateDialog onClose={vi.fn()} onCreated={vi.fn()} />)

    await user.type(screen.getByLabelText('Nome'), 'águias fc')
    await user.type(screen.getByLabelText('Sigla'), 'AGF')
    await user.click(screen.getByRole('button', { name: 'Criar clube' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível criar o clubeJá existe um clube com o nome “Águias FC”.',
    )
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Sigla')).toHaveAttribute('aria-invalid', 'false')
  })
})
