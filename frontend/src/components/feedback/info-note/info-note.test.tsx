import { render, screen } from '@testing-library/react'
import { Lock } from 'lucide-react'
import { InfoNote } from './info-note'

describe('InfoNote', () => {
  it('deve mostrar o texto com o ícone e o fundo cinza', () => {
    const { container } = render(<InfoNote>A taxa é de 5%.</InfoNote>)

    expect(screen.getByText('A taxa é de 5%.')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-muted/50')
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('deve usar borda tracejada e outro ícone', () => {
    const { container } = render(
      <InfoNote icon={Lock} variant="dashed">
        Não mudam depois do cadastro.
      </InfoNote>,
    )

    expect(container.firstChild).toHaveClass('border-dashed')
    expect(container.firstChild).not.toHaveClass('bg-muted/50')
  })

  it('deve mostrar o título com a explicação embaixo', () => {
    render(
      <InfoNote title="Como sai o placar">
        <p>Cada time faz 3 ataques.</p>
      </InfoNote>,
    )

    expect(screen.getByText('Como sai o placar')).toHaveClass('font-medium')
    expect(screen.getByText('Cada time faz 3 ataques.')).toBeInTheDocument()
  })

  it('deve anunciar o aviso de envio como status', () => {
    render(
      <InfoNote variant="outline" role="status">
        Enviando a compra.
      </InfoNote>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Enviando a compra.')
  })
})
