import { screen } from '@testing-library/react'
import { renderPage } from '@/test/render'
import { AppLayout } from './app-layout'

describe('AppLayout', () => {
  it('deve renderizar os links de navegação da Liga Passe', () => {
    renderPage(<AppLayout />)

    expect(screen.getByRole('link', { name: /passe, página inicial/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Jogadores' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Clubes' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Partidas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Classificação' })).toBeInTheDocument()
  })

  it('deve renderizar o relógio com fuso de Brasília', () => {
    renderPage(<AppLayout />)

    expect(screen.getByTitle('Horário de Brasília (UTC−3)')).toBeInTheDocument()
  })
})
