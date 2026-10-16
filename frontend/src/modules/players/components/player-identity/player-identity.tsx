import { cn } from '@/lib/utils'
import { PlayerAvatar } from '../player-avatar/player-avatar'
import type { PlayerIdentityProps } from './player-identity.types'

/** Avatar com o nome do jogador e, se houver, um detalhe embaixo (tabelas, listas, diálogos) */
export function PlayerIdentity({ id, name, detail, className }: PlayerIdentityProps) {
  return (
    <span className={cn('flex min-w-0 items-center gap-3', className)}>
      <PlayerAvatar id={id} name={name} />
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-medium">{name}</span>
        {detail && <span className="block text-xs text-muted-foreground">{detail}</span>}
      </span>
    </span>
  )
}
