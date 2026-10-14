import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lineupFixture, squadPlayerFixture as player } from '../../clubs.fixtures'
import { LineupEditor } from './lineup-editor'
import type { LineupEditorProps } from './lineup-editor.types'

const gol = player({ id: 1, name: 'Bruno Tavares', position: 'GOL' })
const zag = player({ id: 2, name: 'Felipe Moura', position: 'ZAG' })
const lat = player({ id: 3, name: 'Diego Ramos', position: 'LAT', condition: 'MAL_CONDICIONADO' })
const mei = player({ id: 4, name: 'Sávio Lima', position: 'MEI' })
const ata = player({ id: 5, name: 'João Silva', position: 'ATA' })
const sick = player({ id: 6, name: 'Lucas Ferraz', position: 'MEI', condition: 'DOENTE' })
const squad = [gol, zag, lat, mei, ata, sick]

function renderEditor(props: Partial<LineupEditorProps> = {}) {
  const onSave = vi.fn()
  render(
    <LineupEditor
      clubName="Águias FC"
      squad={squad}
      lineup={lineupFixture({
        formation: '2-1-1',
        complete: true,
        players: [gol, zag, lat, mei, ata],
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

  it('deve travar o salvar quando a nova formação deixa vaga sem titular', async () => {
    const user = userEvent.setup()
    renderEditor()

    await user.click(screen.getByRole('radio', { name: /1-2-1/ }))

    const emptyMid = screen.getAllByText('Meio')[0].closest('tr')!
    expect(within(emptyMid).getByRole('combobox')).toBeDisabled()
    expect(screen.getByRole('button', { name: /salvar escalação/i })).toBeDisabled()
    expect(
      screen.getByText('Escolha a formação e um titular para cada vaga para salvar.'),
    ).toBeInTheDocument()
  })

  it('deve avisar que o clube sem escalação não joga', () => {
    renderEditor({ squad: [gol, ata], lineup: lineupFixture() })

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
    expect(screen.getByRole('button', { name: /salvar escalação/i })).toBeDisabled()
  })

  it('deve mostrar a recusa da API e a escalação salva que ficou incompleta', () => {
    renderEditor({
      saveError: 'Lucas Ferraz está DOENTE e não pode ser escalado.',
      lineup: lineupFixture({ formation: '2-1-1', complete: false, players: [gol, lat, mei, ata] }),
    })

    expect(screen.getByRole('alert')).toHaveTextContent('A escalação foi recusada')
    expect(screen.getByText(/A formação 2-1-1 continua salva, com 4 titulares/)).toBeInTheDocument()
  })
})
