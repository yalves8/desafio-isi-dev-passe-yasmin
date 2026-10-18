import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Pitch, PitchPlayer } from '@/components/data-display/pitch/pitch'
import { cn } from '@/lib/utils'
import { CONDITION_RULES } from '@/modules/players'
import { ATTRIBUTE_LABEL } from '../../league.constants'
import { startersFromDuels, type MatchStarter } from '../../league.utils'
import type { MatchPitchProps } from './match-pitch.types'
import { pitchSpots } from './match-pitch.utils'

/** Posição e valores usados nos duelos (ex.: "ATA · Fin 80 · Dri 72") */
function starterDetail(starter: MatchStarter) {
  const values = starter.values
    .map((v) => `${ATTRIBUTE_LABEL[v.attribute].short} ${v.value}`)
    .join(' · ')
  return `${starter.position} · ${values}`
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
    <Pitch
      orientation="horizontal"
      label={`Campo com os titulares de ${match.home.club_name} e ${match.away.club_name}`}
    >
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
            <PitchPlayer
              name={starter.name}
              label={starter.name}
              detail={starterDetail(starter)}
              tone={side === 'home' ? 'primary' : 'light'}
              size="lg"
              worn={CONDITION_RULES[starter.condition].worn}
              scored={starter.scored}
            />
          </span>
        )),
      )}
    </Pitch>
  )
}
