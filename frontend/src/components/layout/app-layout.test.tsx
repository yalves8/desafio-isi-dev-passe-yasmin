import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import userEvent from '@testing-library/user-event'
import { clubsService } from '@/api/clubs.service'
import { playersService } from '@/api/players.service'
import { renderPage } from '@/test/render'
import { AppLayout } from './app-layout'
import { useBreadcrumbDetail } from '@/hooks/use-breadcrumb-detail'
import { getBreadcrumb } from './layout.constants'

vi.mock('@/api/players.service', () => ({ playersService: { list: vi.fn() } }))
vi.mock('@/api/clubs.service', () => ({ clubsService: { list: vi.fn() } }))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(playersService.list).mockResolvedValue({
    data: [],
    meta: { page: 1, limit: 1, total_items: 23, total_pages: 23 },
  })
  vi.mocked(clubsService.list).mockResolvedValue([
    { id: 1, name: 'Águias FC', acronym: 'AGU', cash: 300, squad_value: 0, net_worth: 300 },
    { id: 2, name: 'Delta FC', acronym: 'DEL', cash: 300, squad_value: 0, net_worth: 300 },
  ])
})

describe('AppLayout', () => {
  it('deve renderizar a navegação com contadores e os clubes da liga', async () => {
    renderPage(<AppLayout />, { route: '/jogadores', path: '/jogadores' })

    expect(screen.getByRole('link', { name: /passe, página inicial/i })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /jogadores\s*23/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /clubes\s*2/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Partidas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Classificação' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /águias fc/i })).toHaveAttribute('href', '/clubes/1')
    expect(screen.getByText('2 clubes · 23 jogadores')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma partida ainda')).toBeInTheDocument()
  })

  it('deve mostrar a trilha da tela atual e o fuso de Brasília', () => {
    renderPage(<AppLayout />, { route: '/jogadores', path: '/jogadores' })

    const trail = screen.getByRole('navigation', { name: 'Trilha' })
    expect(trail).toHaveTextContent('Mercado')
    expect(trail).toHaveTextContent('Jogadores')
    expect(screen.getByTitle('Horário de Brasília (UTC−3)')).toBeInTheDocument()
  })

  it('deve recarregar os dados ao clicar em atualizar', async () => {
    const user = userEvent.setup()
    renderPage(<AppLayout />, { route: '/jogadores', path: '/jogadores' })
    await screen.findByRole('link', { name: /jogadores\s*23/i })

    await user.click(screen.getByRole('button', { name: 'Atualizar dados' }))

    await waitFor(() => expect(clubsService.list).toHaveBeenCalledTimes(2))
  })
})

describe('trilha com o item da tela', () => {
  function ClubScreen() {
    useBreadcrumbDetail('Águias FC')
    return <p>tela do clube</p>
  }

  it('deve mostrar o nome definido pela tela, com link para a lista', async () => {
    render(
      <MemoryRouter initialEntries={['/clubes/1']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/clubes/:id" element={<ClubScreen />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const trail = screen.getByRole('navigation', { name: 'Trilha' })
    expect(await within(trail).findByText('Águias FC')).toHaveAttribute('aria-current', 'page')
    expect(within(trail).getByRole('link', { name: 'Clubes' })).toHaveAttribute('href', '/clubes')
  })
})

describe('getBreadcrumb', () => {
  it('deve achar grupo e tela pelo primeiro segmento da URL', () => {
    expect(getBreadcrumb('/clubes/3')).toEqual({ group: 'Mercado', page: 'Clubes', to: '/clubes' })
    expect(getBreadcrumb('/classificacao')).toEqual({
      group: 'Liga',
      page: 'Classificação',
      to: '/classificacao',
    })
    expect(getBreadcrumb('/inexistente')).toBeNull()
  })
})
