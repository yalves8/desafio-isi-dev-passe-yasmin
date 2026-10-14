import { HeartPulse, Plus } from 'lucide-react'
import { getInitials } from '@/lib/format'
import { SECTORS } from '../../clubs.constants'
import type { LineupRow, LineupSector } from '../../clubs.types'
import type { LineupPitchProps } from './lineup-pitch.types'

/** De cima para baixo: ataque, meio, defesa e goleiro */
const ROW_ORDER: LineupSector[] = ['ATT', 'MID', 'DEF', 'GOL']

function PitchSpot({ row }: { row: LineupRow }) {
  const { player } = row
  const label = player ? player.name.trim().split(/\s+/).at(-1) : SECTORS[row.slot.sector].short
  return (
    <span className="flex flex-col items-center gap-1">
      {player ? (
        <span className="relative">
          <span className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-semibold text-white shadow">
            {getInitials(player.name)}
          </span>
          {player.condition === 'MAL_CONDICIONADO' && (
            <span
              title="Mal condicionado"
              className="absolute -top-1 -left-1 flex size-4 items-center justify-center rounded-full border border-white bg-amber-600 text-white"
            >
              <HeartPulse className="size-2.5" aria-hidden />
            </span>
          )}
        </span>
      ) : (
        <span className="flex size-9 items-center justify-center rounded-full border-2 border-dashed border-white/70 text-white/80">
          <Plus className="size-4" aria-hidden />
        </span>
      )}
      <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
        {label}
      </span>
    </span>
  )
}

/** Prévia da formação no campo; vagas vazias ficam tracejadas */
export function LineupPitch({ rows }: LineupPitchProps) {
  const lines = ROW_ORDER.map((sector) => rows.filter((r) => r.slot.sector === sector)).filter(
    (line) => line.length > 0,
  )
  return (
    <div
      role="img"
      aria-label={`Campo com ${rows.filter((r) => r.player).length} de ${rows.length} titulares`}
      className="relative h-90 overflow-hidden rounded-xl bg-[repeating-linear-gradient(180deg,#14532d_0_40px,#166534_40px_80px)]"
    >
      <span className="absolute inset-2 rounded-sm border border-white/30" aria-hidden />
      <span className="absolute inset-x-2 top-1/3 border-t border-white/30" aria-hidden />
      <span
        className="absolute top-1/3 left-1/2 size-18 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
        aria-hidden
      />
      <span
        className="absolute bottom-2 left-1/2 h-16 w-1/2 -translate-x-1/2 border-x border-t border-white/30"
        aria-hidden
      />
      <div className="relative flex h-full flex-col justify-around py-4">
        {lines.map((line) => (
          <div key={line[0].slot.sector} className="flex justify-around px-6">
            {line.map((row) => (
              <PitchSpot key={row.slot.key} row={row} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
