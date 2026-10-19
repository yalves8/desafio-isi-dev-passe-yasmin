import { HeartPulse, Plus } from 'lucide-react'
import { SoccerBall } from '@/components/data-display/soccer-ball/soccer-ball'
import { getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PitchPlayerProps, PitchProps } from './pitch.types'

const LINE = 'absolute border-white/30'

/** Linhas do campo: a escalação mostra meio campo (ataque em cima); a partida, o campo inteiro */
const FIELDS = {
  vertical: {
    className: 'h-90 bg-[repeating-linear-gradient(180deg,#14532d_0_40px,#166534_40px_80px)]',
    lines: [
      'inset-2 rounded-sm border',
      'inset-x-2 top-1/3 border-t',
      'top-1/3 left-1/2 size-18 -translate-x-1/2 -translate-y-1/2 rounded-full border',
      'bottom-2 left-1/2 h-16 w-1/2 -translate-x-1/2 border-x border-t',
    ],
  },
  horizontal: {
    className: 'h-110 bg-[repeating-linear-gradient(90deg,#14532d_0_54px,#166534_54px_108px)]',
    lines: [
      'inset-6 rounded-sm border',
      'inset-y-6 left-1/2 border-l',
      'top-1/2 left-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border',
      'top-1/2 left-6 h-1/2 w-24 -translate-y-1/2 border-y border-r',
      'top-1/2 right-6 h-1/2 w-24 -translate-y-1/2 border-y border-l',
    ],
  },
} as const

/** Gramado listrado com as linhas do campo; os jogadores e as etiquetas vêm como filhos */
export function Pitch({ orientation, label, children }: PitchProps) {
  const field = FIELDS[orientation]
  return (
    <div
      role="img"
      aria-label={label}
      className={cn('relative overflow-hidden rounded-xl', field.className)}
    >
      {field.lines.map((line) => (
        <span key={line} className={cn(LINE, line)} aria-hidden />
      ))}
      {children}
    </div>
  )
}

const SIZES = {
  md: { circle: 'size-9 text-xs', worn: '-top-1 -left-1 size-4' },
  lg: { circle: 'size-10 text-sm', worn: '-top-1 -left-1.5 size-4.5' },
} as const

/** Jogador no campo: círculo com as iniciais, selos de condição e de gol, nome embaixo */
export function PitchPlayer({
  name,
  label,
  detail,
  tone = 'primary',
  size = 'md',
  worn = false,
  scored = false,
}: PitchPlayerProps) {
  const sizes = SIZES[size]
  return (
    <span className="flex flex-col items-center gap-1">
      {name ? (
        <span className="relative">
          <span
            className={cn(
              'flex items-center justify-center rounded-full border-2 font-semibold shadow',
              sizes.circle,
              tone === 'primary'
                ? 'border-white bg-primary text-white'
                : 'border-zinc-200 bg-white text-zinc-900',
            )}
          >
            {getInitials(name)}
          </span>
          {worn && (
            <span
              title="Mal condicionado"
              className={cn(
                'absolute flex items-center justify-center rounded-full border border-white bg-amber-600 text-white',
                sizes.worn,
              )}
            >
              <HeartPulse className="size-2.5" aria-label="Mal condicionado" />
            </span>
          )}
          {scored && (
            <span title="Gol no duelo" className="absolute -top-1 -right-1.5 text-zinc-900">
              <SoccerBall className="size-4.5" aria-label="Gol no duelo" />
            </span>
          )}
        </span>
      ) : (
        <span
          className={cn(
            'flex items-center justify-center rounded-full border-2 border-dashed border-white/70 text-white/80',
            sizes.circle,
          )}
        >
          <Plus className="size-4" aria-hidden />
        </span>
      )}
      <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-white">
        {label}
      </span>
      {detail && (
        <span className="rounded-md bg-black/40 px-1.5 py-0.5 text-[11px] whitespace-nowrap text-white/90">
          {detail}
        </span>
      )}
    </span>
  )
}
