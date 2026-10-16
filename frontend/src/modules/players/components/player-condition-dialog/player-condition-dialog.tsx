import { Lock } from 'lucide-react'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { AlertMessage } from '@/components/feedback/alert-message/alert-message'
import { RadioCard } from '@/components/form/radio-card/radio-card'
import { RadioGroup } from '@/components/ui/radio-group'
import { CONDITION_OPTIONS } from '../../players.constants'
import { ConditionBadge } from '../condition-badge/condition-badge'
import { PlayerSummary } from '../player-summary/player-summary'
import { usePlayerConditionDialog } from './player-condition-dialog.hook'
import type { PlayerConditionDialogProps } from './player-condition-dialog.types'

export function PlayerConditionDialog({
  player,
  club,
  isSubmitting,
  onClose,
  onConfirm,
}: PlayerConditionDialogProps) {
  const { selected, select, isBlocked, unchanged, showLineupNotice } =
    usePlayerConditionDialog(player)

  return (
    <ActionDialog
      title="Alterar condição física"
      description="A condição muda o desconto do valor de mercado, recalculado ao salvar."
      busy={isSubmitting}
      onClose={onClose}
      confirm={{
        label: 'Salvar condição',
        busyLabel: 'Salvando…',
        disabled: unchanged,
        onClick: () => onConfirm(selected),
      }}
    >
      <PlayerSummary player={player} aside={<ConditionBadge condition={player.condition} />} />

      <RadioGroup
        value={selected}
        onValueChange={select}
        aria-label="Condição física"
        className="gap-2"
      >
        {CONDITION_OPTIONS.map((option) => {
          const blocked = isBlocked(option.value)
          return (
            <RadioCard
              key={option.value}
              id={`condition-${option.value}`}
              value={option.value}
              checked={selected === option.value}
              disabled={blocked}
              labelledBy={`condition-${option.value}-label`}
              describedBy={`condition-${option.value}-description`}
            >
              {(radio) => (
                <>
                  <span className="mt-0.5 flex">{radio}</span>
                  <span className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-2 font-medium">
                      <span id={`condition-${option.value}-label`}>{option.label}</span>
                      {option.value === player.condition && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium">
                          Atual
                        </span>
                      )}
                    </span>
                    <span
                      id={`condition-${option.value}-description`}
                      className="flex flex-col gap-0.5 text-xs text-muted-foreground"
                    >
                      {option.value === player.condition && (
                        <span className="sr-only">Atual. </span>
                      )}
                      {option.description}
                      {blocked && (
                        <span className="flex items-center gap-1">
                          <Lock className="size-3" aria-hidden />
                          De Doente não passa direto para Apto.
                        </span>
                      )}
                    </span>
                  </span>
                </>
              )}
            </RadioCard>
          )
        })}
      </RadioGroup>

      {showLineupNotice && (
        <AlertMessage variant="warning" title={`Se ${player.name} for titular`}>
          Ao passar a Doente, ele sai da escalação, e o {club?.name ?? 'clube'} só volta a jogar
          partidas depois de escalar de novo os 5 titulares.
        </AlertMessage>
      )}
    </ActionDialog>
  )
}
