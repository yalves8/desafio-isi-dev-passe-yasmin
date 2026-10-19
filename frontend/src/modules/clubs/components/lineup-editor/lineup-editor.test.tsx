import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lineupFixture, squadPlayerFixture as player } from '../../clubs.fixtures'
import { LineupEditor } from './lineup-editor'
import type { LineupEditorProps } from './lineup-editor.types'

const goalkeeper = player({ id: 1, name: 'Bruno Tavares', position: 'GOL' })
const centerBack = player({ id: 2, name: 'Felipe Moura', position: 'ZAG' })
const fullBack = player({
  id: 3,
  name: 'Diego Ramos',
  position: 'LAT',
  condition: 'MAL_CONDICIONADO',
})
const midfielder = player({ id: 4, name: 'Sávio Lima', position: 'MEI' })
const striker = player({ id: 5, name: 'João Silva', position: 'ATA' })
const sick = player({ id: 6, name: 'Lucas Ferraz', position: 'MEI', condition: 'DOENTE' })
const squad = [goalkeeper, centerBack, fullBack, midfielder, striker, sick]

function renderEditor(props: Partial<LineupEditorProps> = {}) {
  const onSave = vi.fn()
  render(
    <LineupEditor
      clubName="Águias FC"
      squad={squad}
      lineup={lineupFixture({
        formation: '2-1-1',
        complete: true,
        players: [goalkeeper, centerBack, fullBack, midfielder, striker],
      })}
      isSaving={false}
      onSave={onSave}
      {...props}
    />,
  )
  return onSave
}

describe('LineupEditor', () => {
  it('deve carregar a escalação salva e salvar formação e os 5 ids', async () => {
    const user = userEvent.setup()
    const onSave = renderEditor()

    expect(screen.getByText('Completa')).toBeInTheDocument()
    expect(screen.getByText('Diego Ramos está mal condicionado')).toBeInTheDocument()
    expect(screen.getByText('Doente não pode ser escalado.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /salvar escalação/i }))

    expect(onSave).toHaveBeenCalledWith('2-1-1', [1, 2, 3, 4, 5])
  })

  it('deve avisar alterações não salvas e voltar ao selo da escalação gravada ao cancelar', async () => {
    const user = userEvent.setup()
    renderEditor()

    await user.click(screen.getByRole('radio', { name: /1-2-1/ }))
    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()
    expect(screen.queryByText('Completa')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByText('Completa')).toBeInTheDocument()
  })

  it('deve apontar a vaga vazia ao salvar, sem enviar', async () => {
    const user = userEvent.setup()
    const onSave = renderEditor()

    await user.click(screen.getByRole('radio', { name: /1-2-1/ }))
    expect(
      screen.getByText('Escolha a formação e um titular para cada vaga para salvar.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /salvar escalação/i }))

    expect(onSave).not.toHaveBeenCalled()
    const emptyMid = screen.getAllByText('Meio')[0].closest('tr')!
    expect(within(emptyMid).getByRole('combobox')).toBeDisabled()
    expect(within(emptyMid).getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
    expect(
      within(emptyMid).getByText('Nenhum jogador disponível para esta vaga: troque a formação.'),
    ).toBeInTheDocument()
  })

  it('deve pedir o titular na vaga vazia e salvar depois de escolher', async () => {
    const user = userEvent.setup()
    const onSave = renderEditor({
      lineup: lineupFixture({
        formation: '2-1-1',
        complete: false,
        players: [goalkeeper, fullBack, midfielder, striker],
      }),
    })

    await user.click(screen.getByRole('button', { name: /salvar escalação/i }))
    expect(onSave).not.toHaveBeenCalled()
    const emptyDefense = screen.getByRole('combobox', {
      name: /defesa/i,
      description: 'Escolha o titular.',
    })

    await user.click(emptyDefense)
    await user.click(await screen.findByRole('option', { name: 'Felipe Moura (ZAG)' }))
    expect(screen.queryByText('Escolha o titular.')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /salvar escalação/i }))

    expect(onSave).toHaveBeenCalledWith('2-1-1', [1, 2, 3, 4, 5])
  })

  it('deve travar o salvar enquanto envia', () => {
    renderEditor({ isSaving: true })

    expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled()
  })

  it('deve avisar que o clube sem escalação não joga', () => {
    renderEditor({ squad: [goalkeeper, striker], lineup: lineupFixture() })

    expect(
      screen.getByText('Escalação incompleta: o Águias FC não pode jogar partidas'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/O elenco tem 2 jogadores, e a escalação precisa de 5/),
    ).toBeInTheDocument()
    expect(screen.getByText('Incompleta')).toBeInTheDocument()
    // Sugere o elenco disponível nas vagas, sem salvar
    expect(
      screen.getByText('Nenhum reserva: os 2 jogadores do elenco estão escolhidos.'),
    ).toBeInTheDocument()
    // Figma (Gama SC): sem jogadores para fechar uma formação, salvar fica travado
    expect(screen.getByRole('button', { name: /salvar escalação/i })).toBeDisabled()
  })

  it('deve explicar quem falta quando a escalação salva ficou sem formação possível', () => {
    // Figma: Felipe Moura vendido, Lucas Ferraz DOENTE no elenco
    renderEditor({
      squad: [goalkeeper, fullBack, midfielder, striker, sick],
      lineup: lineupFixture({
        formation: '2-1-1',
        complete: false,
        players: [goalkeeper, fullBack, midfielder, striker],
      }),
    })

    expect(
      screen.getByText(
        'Um titular saiu da escalação: a 2-1-1 continua salva, com 4 titulares. Com o Lucas Ferraz DOENTE, sobram 3 jogadores de linha que podem ser escalados, e nenhuma formação fecha: o clube precisa comprar um jogador e escalar de novo.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salvar escalação/i })).toBeDisabled()
  })

  it('deve dizer que não sobra goleiro quando o único disponível está DOENTE', () => {
    const sickKeeper = player({ id: 7, name: 'Rui Prado', position: 'GOL', condition: 'DOENTE' })
    renderEditor({
      squad: [sickKeeper, centerBack, fullBack, midfielder, striker],
      lineup: lineupFixture({
        formation: '2-1-1',
        complete: false,
        players: [centerBack, fullBack, midfielder, striker],
      }),
    })

    expect(
      screen.getByText(
        'Um titular saiu da escalação: a 2-1-1 continua salva, com 4 titulares. Com o Rui Prado DOENTE, não sobra goleiro que possa ser escalado, e nenhuma formação fecha: o clube precisa comprar um jogador e escalar de novo.',
      ),
    ).toBeInTheDocument()
  })

  it('deve mostrar a recusa da API e a escalação salva que ficou incompleta', () => {
    renderEditor({
      saveError: 'Lucas Ferraz está DOENTE e não pode ser escalado.',
      lineup: lineupFixture({
        formation: '2-1-1',
        complete: false,
        players: [goalkeeper, fullBack, midfielder, striker],
      }),
    })

    expect(screen.getByRole('alert')).toHaveTextContent('A escalação foi recusada')
    expect(screen.getByText(/a 2-1-1 continua salva, com 4 titulares/)).toBeInTheDocument()
  })
})
