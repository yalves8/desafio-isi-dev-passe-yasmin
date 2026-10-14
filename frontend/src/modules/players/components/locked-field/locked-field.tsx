import { Lock } from 'lucide-react'
import type { LockedFieldProps } from './locked-field.types'

/** Campo calculado pela API: aparece travado até o jogador ser salvo */
export function LockedField({ label, hint }: LockedFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm leading-none font-medium text-muted-foreground">{label}</span>
      <div className="flex h-9 items-center gap-2 rounded-lg border border-dashed bg-muted/60 px-3 text-sm text-muted-foreground">
        <Lock className="size-3.5" aria-hidden />
        Após salvar
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}
