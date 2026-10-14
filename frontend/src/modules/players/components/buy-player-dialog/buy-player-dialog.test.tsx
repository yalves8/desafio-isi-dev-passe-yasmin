import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { playersService } from '@/api/players.service'
import type { PurchaseResult } from '@/api/types'
import { clubFixture } from '@/modules/clubs/clubs.fixtures'
import { playerFixture } from '../../players.fixtures'
import { BuyPlayerDialog } from './buy-player-dialog'

vi.mock('@/api/players.service', () => ({ playersService: { buy: vi.fn() } }))

const player = playerFixture({
  id: 9,
  name: 'Eduardo Paiva',
  position: 'MEI',
  age: 26,
  market_value: 46,
  club_id: null,
})
const clubs = [
  clubFixture({ id: 1, name: 'Águias FC', acronym: 'AGU', cash: 75.58 }),
  clubFixture({ id: 6, name: 'Tubarões EC', acronym: 'TUB', cash: 300 }),
]

const purchase: PurchaseResult = {
  id: 10,
  club_id: 6,
  player_id: 9,
  player_name: 'Eduardo Paiva',
  type: 'COMPRA',
  value: 46,
  fee: 2.3,
  penalty: 0,
  profit: null,
  cash_change: -48.3,
  created_at: '2026-11-12T15:00:00-03:00',
  contract: { purchase_value: 46, loyalty_until: '2027-11-12T15:00:00-03:00', status: 'ATIVO' },
  club_cash: 251.7,
}

function apiError(status?: number, message = '') {
  const config = { headers: new AxiosHeaders() }
  const response =
    status === undefined
      ? undefined
      : { status, statusText: '', data: { message }, headers: {}, config }
  return new AxiosError(
    'erro',
    status === undefined ? 'ERR_NETWORK' : String(status),
    config,
    {},
    response,
  )
}

async function chooseClub(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
  await user.click(screen.getByRole('combobox', { name: 'Clube comprador' }))
  await user.click(await screen.findByRole('option', { name }))
}

describe('BuyPlayerDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Só o Date é simulado: 12/11/2026 15:00 em Brasília
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-12T15:00:00-03:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('deve enviar o clube e o fim da fidelidade com o fuso e devolver o que a API respondeu', async () => {
    const user = userEvent.setup()
    vi.mocked(playersService.buy).mockResolvedValue(purchase)
    const onBought = vi.fn()
    render(<BuyPlayerDialog player={player} clubs={clubs} onClose={vi.fn()} onBought={onBought} />)

    expect(screen.getByText('MEI · Meio-campo · 26 anos')).toBeInTheDocument()
    expect(screen.getByText('46,00')).toBeInTheDocument()
    expect(screen.getByLabelText('Fim da fidelidade')).toHaveValue('2027-11-12')
    expect(screen.getByLabelText('Hora do fim da fidelidade')).toHaveValue('15:00')
    // O calendário só oferece de hoje até 1.095 dias depois
    expect(screen.getByLabelText('Fim da fidelidade')).toHaveAttribute('min', '2026-11-12')
    expect(screen.getByLabelText('Fim da fidelidade')).toHaveAttribute('max', '2029-11-11')

    await chooseClub(user, /Tubarões EC \(TUB\) · caixa 300,00/)
    expect(
      screen.getByText(
        'Caixa atual: 300,00. O custo total (valor + taxa) pode ir até 50% do caixa.',
      ),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirmar compra' }))

    expect(playersService.buy).toHaveBeenCalledWith(9, {
      club_id: 6,
      loyalty_until: '2027-11-12T15:00-03:00',
    })
    expect(onBought).toHaveBeenCalledWith(purchase)
  })

  it('deve exigir o clube comprador antes de enviar', async () => {
    const user = userEvent.setup()
    render(<BuyPlayerDialog player={player} clubs={clubs} onClose={vi.fn()} onBought={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Confirmar compra' }))

    expect(await screen.findByText('Escolha o clube comprador.')).toBeInTheDocument()
    expect(playersService.buy).not.toHaveBeenCalled()
  })

  it('deve mostrar no diálogo a recusa devolvida pela API', async () => {
    const user = userEvent.setup()
    vi.mocked(playersService.buy).mockRejectedValue(
      apiError(409, 'O Águias FC já vendeu o Lucas Ferraz e não pode comprá-lo de novo.'),
    )
    render(<BuyPlayerDialog player={player} clubs={clubs} onClose={vi.fn()} onBought={vi.fn()} />)

    await chooseClub(user, /Águias FC/)
    await user.click(screen.getByRole('button', { name: 'Confirmar compra' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Compra recusadaO Águias FC já vendeu o Lucas Ferraz e não pode comprá-lo de novo.',
    )
    expect(screen.getByRole('button', { name: 'Confirmar compra' })).toBeEnabled()
  })

  it('deve oferecer tentar de novo quando a resposta não chega', async () => {
    const user = userEvent.setup()
    vi.mocked(playersService.buy).mockRejectedValueOnce(apiError()).mockResolvedValueOnce(purchase)
    const onBought = vi.fn()
    render(<BuyPlayerDialog player={player} clubs={clubs} onClose={vi.fn()} onBought={onBought} />)

    await chooseClub(user, /Tubarões EC/)
    await user.click(screen.getByRole('button', { name: 'Confirmar compra' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sem conexãoA compra não foi confirmada. Verifique a conexão e tente de novo.',
    )
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(playersService.buy).toHaveBeenCalledTimes(2)
    expect(onBought).toHaveBeenCalledWith(purchase)
  })
})
