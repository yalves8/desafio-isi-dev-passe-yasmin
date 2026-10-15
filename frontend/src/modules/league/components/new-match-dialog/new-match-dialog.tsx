import { CircleAlert, Info, Shield, Swords } from 'lucide-react'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { FormField } from '@/components/form/form-field/form-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNewMatchDialog } from './new-match-dialog.hook'
import type { NewMatchDialogProps } from './new-match-dialog.types'

function ClubSelect({
  id,
  value,
  invalid,
  clubs,
  disabled,
  onChange,
}: {
  id: string
  value?: number
  invalid: boolean
  clubs: NewMatchDialogProps['clubs']
  disabled: boolean
  onChange: (id: number) => void
}) {
  return (
    <Select
      value={value === undefined ? '' : String(value)}
      onValueChange={(v) => onChange(Number(v))}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className="h-9 w-full gap-2 pl-3 text-left *:data-[slot=select-value]:flex-1"
        aria-invalid={invalid}
        aria-describedby={`${id}-message`}
      >
        <Shield className="text-muted-foreground" aria-hidden />
        <SelectValue placeholder="Escolha o clube" />
      </SelectTrigger>
      <SelectContent>
        {clubs.map((club) => (
          <SelectItem key={club.id} value={String(club.id)}>
            {club.name} ({club.acronym})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

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
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <span className="font-medium">Não foi possível jogar a partida</span>
            <br />
            {apiError}
          </p>
        </div>
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

      <div className="flex flex-col gap-2 rounded-lg border bg-muted/50 px-3 py-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Info className="size-4" aria-hidden /> Como sai o placar
        </p>
        <p>
          Cada time faz 3 ataques. Pela ordem do elenco, os jogadores de linha vão do 1º (o mais
          recuado) ao 4º (o mais avançado): o 4º enfrenta o goleiro, o 3º enfrenta o 1º e o 2º
          enfrenta o 2º do adversário. O atacante usa finalização (ATA), passe (MEI) ou drible (ZAG
          e LAT), e quem defende usa defesa. É gol só quando o ataque é maior; mal condicionado joga
          com 15% a menos.
        </p>
        <p>Os dois clubes precisam ter os 5 titulares escalados. A partida não mexe no caixa.</p>
      </div>
    </ActionDialog>
  )
}
