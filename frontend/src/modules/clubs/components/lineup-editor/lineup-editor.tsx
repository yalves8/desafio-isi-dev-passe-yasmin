import { Check, CircleCheck, PencilLine, Swords, TriangleAlert } from 'lucide-react'
import { Tag } from '@/components/data-display/tag/tag'
import { AlertMessage } from '@/components/feedback/alert-message/alert-message'
import { Button } from '@/components/ui/button'
import { FormationPicker } from '../formation-picker/formation-picker'
import { LineupPitch } from '../lineup-pitch/lineup-pitch'
import { LineupReserves } from '../lineup-reserves/lineup-reserves'
import { LineupSlots } from '../lineup-slots/lineup-slots'
import { useLineupEditor } from './lineup-editor.hook'
import type { LineupEditorProps } from './lineup-editor.types'
import { joinNames } from './lineup-editor.utils'

/** Aba Escalação: formação, 5 titulares, prévia no campo e reservas (RN19) */
export function LineupEditor({
  clubName,
  squad,
  lineup,
  isSaving,
  saveError,
  onSave,
}: LineupEditorProps) {
  const editor = useLineupEditor({ lineup, squad, onSave })
  const incompleteTitle = `Escalação incompleta: o ${clubName} não pode jogar partidas`
  const neverSaved = lineup.formation === null

  return (
    <div className="flex flex-col gap-6">
      {neverSaved && (
        <AlertMessage variant="warning" title={incompleteTitle}>
          {editor.canClose
            ? 'O clube ainda não tem escalação. Escolha a formação e os 5 titulares e salve.'
            : `O elenco tem ${squad.length} ${squad.length === 1 ? 'jogador' : 'jogadores'}, e a escalação precisa de 5: 1 goleiro e 4 jogadores de linha. Compre jogadores e salve a escalação com os 5 titulares.`}
        </AlertMessage>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_320px]">
        <section
          aria-labelledby="starters-title"
          className="overflow-hidden rounded-xl border bg-card"
        >
          <div className="flex items-start justify-between gap-3 border-b p-5">
            <div>
              <h3 id="starters-title" className="text-base font-semibold">
                Titulares
              </h3>
              <p className="text-xs text-muted-foreground">
                1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar troca os 5 de uma
                vez.
              </p>
            </div>
            {editor.hasChanges ? (
              <Tag variant="muted">
                <PencilLine className="size-3" aria-hidden /> Alterações não salvas
              </Tag>
            ) : lineup.complete ? (
              <Tag variant="success">
                <CircleCheck className="size-3" aria-hidden /> Completa
              </Tag>
            ) : (
              <Tag variant="warning">
                <TriangleAlert className="size-3" aria-hidden /> Incompleta
              </Tag>
            )}
          </div>

          <div className="flex flex-col gap-4 p-5">
            {saveError && (
              <AlertMessage variant="error" title="A escalação foi recusada">
                {saveError}
              </AlertMessage>
            )}
            {!neverSaved && !lineup.complete && (
              <AlertMessage variant="warning" title={incompleteTitle}>
                A formação {lineup.formation} continua salva, com {lineup.players.length}{' '}
                {lineup.players.length === 1 ? 'titular' : 'titulares'}. Titular vendido ou que
                ficou Doente sai da escalação e não volta sozinho.{' '}
                {editor.canClose
                  ? 'Escolha os titulares e salve de novo.'
                  : 'Com os jogadores disponíveis, nenhuma formação fecha: o clube precisa comprar um jogador e escalar de novo.'}
              </AlertMessage>
            )}
            <div>
              <p className="font-medium">Formação</p>
              <p className="text-xs text-muted-foreground">
                Os números contam os jogadores de linha de trás para frente. O goleiro fica fora da
                conta.
              </p>
            </div>
            <FormationPicker value={editor.formation} onChange={editor.changeFormation} />
          </div>

          <LineupSlots rows={editor.rows} onSelect={editor.select} />

          {editor.worn.length > 0 && (
            <div className="px-5 pt-4">
              <AlertMessage
                variant="warning"
                title={`${joinNames(editor.worn.map((p) => p.name))} ${editor.worn.length === 1 ? 'está mal condicionado' : 'estão mal condicionados'}`}
              >
                {editor.worn.length === 1 ? 'Pode' : 'Podem'} jogar, mas cada atributo vale 15% a
                menos durante a partida.
              </AlertMessage>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 border-t p-5 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground sm:mr-auto sm:max-w-md">
              {editor.filled
                ? 'A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela, e o clube só volta a jogar depois de escalar de novo.'
                : 'Escolha a formação e um titular para cada vaga para salvar.'}
            </p>
            <Button variant="outline" size="md" onClick={editor.reset} disabled={isSaving}>
              Cancelar
            </Button>
            <Button size="md" onClick={editor.submit} disabled={isSaving}>
              <Check /> {isSaving ? 'Salvando…' : 'Salvar escalação'}
            </Button>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section
            aria-labelledby="pitch-title"
            className="overflow-hidden rounded-xl border bg-card"
          >
            <div className="border-b p-5">
              <h3 id="pitch-title" className="text-base font-semibold">
                Em campo
              </h3>
              <p className="text-xs text-muted-foreground">
                Prévia da formação {editor.formation}
                {editor.filled ? ', do goleiro ao ataque.' : '; as vagas vazias ficam tracejadas.'}
              </p>
            </div>
            <div className="p-4">
              <LineupPitch rows={editor.rows} />
            </div>
            <p className="flex gap-2 border-t bg-muted/40 px-5 py-3 text-xs text-muted-foreground">
              <Swords className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Na partida, atacam os 3 jogadores de linha mais avançados e defendem o goleiro e os 2
              mais recuados. É gol quando o ataque é maior que a defesa.
            </p>
          </section>
          <LineupReserves reserves={editor.reserves} squadSize={squad.length} />
        </div>
      </div>
    </div>
  )
}
