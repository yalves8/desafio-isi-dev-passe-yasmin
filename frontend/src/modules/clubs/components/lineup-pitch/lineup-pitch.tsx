import { Pitch, PitchPlayer } from '@/components/data-display/pitch/pitch'
import { CONDITION_RULES } from '@/modules/players'
import { SECTORS } from '../../clubs.constants'
import type { LineupSector } from '../../clubs.types'
import type { LineupPitchProps } from './lineup-pitch.types'

/** De cima para baixo: ataque, meio, defesa e goleiro */
const ROW_ORDER: LineupSector[] = ['ATT', 'MID', 'DEF', 'GK']

/** Prévia da formação no campo; vagas vazias ficam tracejadas */
export function LineupPitch({ rows }: LineupPitchProps) {
  const lines = ROW_ORDER.map((sector) => rows.filter((r) => r.slot.sector === sector)).filter(
    (line) => line.length > 0,
  )
  return (
    <Pitch
      orientation="vertical"
      label={`Campo com ${rows.filter((r) => r.player).length} de ${rows.length} titulares`}
    >
      <div className="relative flex h-full flex-col justify-around py-4">
        {lines.map((line) => (
          <div key={line[0].slot.sector} className="flex justify-around px-6">
            {line.map(({ slot, player }) => (
              <PitchPlayer
                key={slot.key}
                name={player?.name}
                label={
                  player
                    ? (player.name.trim().split(/\s+/).at(-1) ?? '')
                    : SECTORS[slot.sector].short
                }
                worn={player ? CONDITION_RULES[player.condition].worn : false}
              />
            ))}
          </div>
        ))}
      </div>
    </Pitch>
  )
}
