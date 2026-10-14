import { getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PlayerAvatarProps } from './player-avatar.types'

const TONES = [
  'bg-zinc-200 text-zinc-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
  'bg-teal-100 text-teal-700',
  'bg-violet-100 text-violet-700',
]

/** Iniciais em círculo; a cor vem do id, então o mesmo jogador tem sempre a mesma cor */
export function PlayerAvatar({ id, name, className }: PlayerAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium',
        TONES[id % TONES.length],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
