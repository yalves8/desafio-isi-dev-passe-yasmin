import { Lock } from 'lucide-react'
import { POSITION_LABEL, ConditionBadge, PlayerAvatar } from '@/modules/players'
import type { LineupReservesProps } from './lineup-reserves.types'

/** Jogadores do elenco fora da escalação; DOENTE não pode ser escalado (RN19) */
export function LineupReserves({ reserves, squadSize }: LineupReservesProps) {
  return (
    <section aria-labelledby="reserves-title" className="rounded-xl border bg-card">
      <div className="border-b p-5">
        <h3 id="reserves-title" className="text-base font-semibold">
          Reservas
        </h3>
        <p className="text-xs text-muted-foreground">Jogadores do elenco fora da escalação.</p>
      </div>
      {reserves.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">
          {squadSize === 0
            ? 'O elenco ainda não tem jogadores.'
            : `Nenhum reserva: os ${squadSize} jogadores do elenco estão escolhidos.`}
        </p>
      ) : (
        <ul className="flex flex-col gap-3 p-5">
          {reserves.map((player) => (
            <li key={player.id} className="flex flex-col gap-2">
              <span className="flex items-center gap-3">
                <PlayerAvatar id={player.id} name={player.name} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate font-medium">{player.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {POSITION_LABEL[player.position]}
                  </span>
                </span>
                <ConditionBadge condition={player.condition} />
              </span>
              {player.condition === 'DOENTE' && (
                <span className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  <Lock className="size-3.5" aria-hidden />
                  Doente não pode ser escalado.
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
