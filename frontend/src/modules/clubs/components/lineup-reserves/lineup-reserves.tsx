import { Lock } from 'lucide-react'
import { SectionCard } from '@/components/layout/section-card/section-card'
import { cn } from '@/lib/utils'
import { CONDITION_RULES, POSITION_LABEL, ConditionBadge, PlayerIdentity } from '@/modules/players'
import type { LineupReservesProps } from './lineup-reserves.types'

/** Jogadores do elenco fora da escalação; DOENTE não pode ser escalado (RN19) */
export function LineupReserves({ reserves, squadSize }: LineupReservesProps) {
  return (
    <SectionCard
      title="Reservas"
      description="Jogadores do elenco fora da escalação."
      headingLevel={3}
      shadow={false}
      headerClassName="p-5"
    >
      {reserves.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">
          {squadSize === 0
            ? 'O elenco ainda não tem jogadores.'
            : `Nenhum reserva: os ${squadSize} jogadores do elenco estão escolhidos.`}
        </p>
      ) : (
        <ul className="flex flex-col gap-3 p-5">
          {reserves.map((player) => {
            const blocked = !CONDITION_RULES[player.condition].canStart
            return (
              <li key={player.id} className="flex flex-col gap-2">
                {/* Quem não pode ser escalado aparece esmaecido (Figma C06) */}
                <span
                  className={cn('flex items-center gap-3', blocked && 'opacity-60')}
                  data-blocked={blocked || undefined}
                >
                  <PlayerIdentity
                    id={player.id}
                    name={player.name}
                    detail={POSITION_LABEL[player.position]}
                    className="flex-1"
                  />
                  <ConditionBadge condition={player.condition} />
                </span>
                {blocked && (
                  <span className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                    <Lock className="size-3.5" aria-hidden />
                    Doente não pode ser escalado.
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
