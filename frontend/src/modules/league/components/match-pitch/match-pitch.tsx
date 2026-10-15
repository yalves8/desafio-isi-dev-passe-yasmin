import { ArrowLeft, ArrowRight, HeartPulse, Volleyball } from 'lucide-react'
import { getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ATTRIBUTE_LABEL } from '../../league.constants'
import { startersFromDuels, type MatchStarter } from '../../league.utils'
import type { MatchPitchProps } from './match-pitch.types'
import { pitchSpots } from './match-pitch.utils'

function Spot({ starter, side }: { starter: MatchStarter; side: 'home' | 'away' }) {
  const values = starter.values
    .map((v) => `${ATTRIBUTE_LABEL[v.attribute].short} ${v.value}`)
    .join(' · ')
  return (
    <span className="flex flex-col items-center gap-1">
      <span className="relative">
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-full border-2 text-sm font-semibold shadow',
            side === 'home'
              ? 'border-white bg-primary text-white'
              : 'border-zinc-200 bg-white text-zinc-900',
          )}
        >
          {getInitials(starter.name)}
        </span>
        {starter.condition === 'MAL_CONDICIONADO' && (
          <span
            title="Mal condicionado"
            className="absolute -top-1 -left-1.5 flex size-4.5 items-center justify-center rounded-full border border-white bg-amber-600 text-white"
          >
            <HeartPulse className="size-2.5" aria-label="Mal condicionado" />
          </span>
        )}
        {starter.scored && (
          <span
            title="Gol no duelo"
            className="absolute -top-1 -right-1.5 flex size-4.5 items-center justify-center rounded-full bg-white text-zinc-900"
          >
            <Volleyball className="size-3.5" aria-label="Gol no duelo" />
          </span>
        )}
      </span>
      <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-white">
        {starter.name}
      </span>
      <span className="rounded-md bg-black/40 px-1.5 py-0.5 text-[11px] whitespace-nowrap text-white/90">
        {starter.position} · {values}
      </span>
    </span>
  )
}

/** Em campo (Figma L03): os titulares dos dois clubes com os valores usados nos duelos */
export function MatchPitch({ match }: MatchPitchProps) {
  const duels = match.duels ?? []
  const sides = (['home', 'away'] as const).map((side) => ({
    side,
    club: match[side],
    spots: pitchSpots(startersFromDuels(duels, match[side].club_id), side),
  }))

  return (
    <div
      role="img"
      aria-label={`Campo com os titulares de ${match.home.club_name} e ${match.away.club_name}`}
      className="relative h-110 overflow-hidden rounded-xl bg-[repeating-linear-gradient(90deg,#14532d_0_54px,#166534_54px_108px)]"
    >
      <span className="absolute inset-6 rounded-sm border border-white/30" aria-hidden />
      <span className="absolute inset-y-6 left-1/2 border-l border-white/30" aria-hidden />
      <span
        className="absolute top-1/2 left-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
        aria-hidden
      />
      <span
        className="absolute top-1/2 left-6 h-1/2 w-24 -translate-y-1/2 border-y border-r border-white/30"
        aria-hidden
      />
      <span
        className="absolute top-1/2 right-6 h-1/2 w-24 -translate-y-1/2 border-y border-l border-white/30"
        aria-hidden
      />

      {sides.map(({ side, club }) => (
        <span
          key={side}
          className={cn(
            'absolute top-8 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs text-white',
            side === 'home' ? 'left-9' : 'right-9',
          )}
        >
          <span
            className={cn('size-2.5 rounded-full', side === 'home' ? 'bg-primary' : 'bg-white')}
            aria-hidden
          />
          <span className="font-medium">{club.club_name}</span>
          <span className="text-white/80">{club.formation}</span>
          <span className="text-white/60">| ataca</span>
          {side === 'home' ? (
            <ArrowRight className="size-3" aria-hidden />
          ) : (
            <ArrowLeft className="size-3" aria-hidden />
          )}
        </span>
      ))}

      {sides.flatMap(({ side, spots }) =>
        spots.map(({ starter, left, top }) => (
          <span
            key={`${side}-${starter.slot}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <Spot starter={starter} side={side} />
          </span>
        )),
      )}
    </div>
  )
}
