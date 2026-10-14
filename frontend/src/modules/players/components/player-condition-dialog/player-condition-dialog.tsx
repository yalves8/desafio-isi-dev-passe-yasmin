import { Lock, TriangleAlert } from 'lucide-react'
import { ActionDialog } from '@/components/feedback/action-dialog/action-dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
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
            <label
              key={option.value}
              htmlFor={`condition-${option.value}`}
              className={cn(
                'flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-muted/50',
                selected === option.value && 'border-primary bg-blue-50/70 hover:bg-blue-50/70',
                blocked && 'cursor-not-allowed opacity-60 hover:bg-transparent',
              )}
            >
              <RadioGroupItem
                id={`condition-${option.value}`}
                value={option.value}
                disabled={blocked}
                className="mt-0.5"
              />
              <span className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 font-medium">
                  {option.label}
                  {option.value === player.condition && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium">
                      Atual
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
                {blocked && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="size-3" aria-hidden />
                    De Doente não passa direto para Apto.
                  </span>
                )}
              </span>
            </label>
          )
        })}
      </RadioGroup>

      {showLineupNotice && (
        <div
          role="note"
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <span className="font-medium">Se {player.name} for titular</span>
            <br />
            Ao passar a Doente, ele sai da escalação, e o {club?.name ?? 'clube'} só volta a jogar
            partidas depois de escalar de novo os 5 titulares.
          </p>
        </div>
      )}
    </ActionDialog>
  )
}
