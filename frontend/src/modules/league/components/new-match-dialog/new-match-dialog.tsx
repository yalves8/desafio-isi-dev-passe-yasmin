import { Swords } from 'lucide-react'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { AlertMessage } from '@/components/feedback/alert-message/alert-message'
import { InfoNote } from '@/components/feedback/info-note/info-note'
import { ClubSelect } from '@/components/form/club-select/club-select'
import { FormField } from '@/components/form/form-field/form-field'
import { useNewMatchDialog } from './new-match-dialog.hook'
import type { NewMatchDialogProps } from './new-match-dialog.types'

/** Nova partida (Figma L02 e L04): escolhe mandante e visitante; o placar vem da API (RN20) */
export function NewMatchDialog({ clubs, onClose, onPlayed }: NewMatchDialogProps) {
  const { home, away, apiError, refused, isPlaying, onSubmit } = useNewMatchDialog({
    clubs,
    onPlayed,
  })

  return (
    <ActionDialog
      size="md"
      title="Nova partida"
      description="Escolha o mandante e o visitante. O placar sai dos atributos dos titulares, sem sorteio."
      busy={isPlaying}
      onClose={onClose}
      confirm={{
        label: 'Jogar partida',
        busyLabel: 'Jogando…',
        icon: <Swords />,
        onClick: () => void onSubmit(),
      }}
    >
      {apiError && (
        <AlertMessage variant="error" title="Não foi possível jogar a partida">
          {apiError}
        </AlertMessage>
      )}

      <div className="flex flex-col gap-5">
        <FormField
          id="match-home"
          label="Mandante"
          hint="Faz os 3 primeiros ataques."
          error={home.error}
        >
          <ClubSelect
            id="match-home"
            value={home.value}
            invalid={!!home.error || refused === 'home'}
            clubs={clubs}
            disabled={isPlaying}
            onChange={home.onChange}
          />
        </FormField>
        <FormField
          id="match-away"
          label="Visitante"
          hint="Precisa ser um clube diferente do mandante."
          error={away.error}
        >
          <ClubSelect
            id="match-away"
            value={away.value}
            invalid={!!away.error || refused === 'away'}
            clubs={clubs}
            disabled={isPlaying}
            onChange={away.onChange}
          />
        </FormField>
      </div>

      <InfoNote title="Como sai o placar">
        <p>
          Cada time faz 3 ataques. Pela ordem do elenco, os jogadores de linha vão do 1º (o mais
          recuado) ao 4º (o mais avançado): o 4º enfrenta o goleiro, o 3º enfrenta o 1º e o 2º
          enfrenta o 2º do adversário. O atacante usa finalização (ATA), passe (MEI) ou drible (ZAG
          e LAT), e quem defende usa defesa. É gol só quando o ataque é maior; mal condicionado joga
          com 15% a menos.
        </p>
        <p>Os dois clubes precisam ter os 5 titulares escalados. A partida não mexe no caixa.</p>
      </InfoNote>
    </ActionDialog>
  )
}
