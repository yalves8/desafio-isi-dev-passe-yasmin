import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InfoNoteProps } from './info-note.types'

const VARIANTS = {
  muted: 'bg-muted/50',
  dashed: 'border-dashed',
  outline: '',
} as const

/** Nota de apoio dos diálogos: ícone e texto curto, ou título com a explicação embaixo */
export function InfoNote({
  icon: Icon = Info,
  title,
  variant = 'muted',
  role,
  children,
}: InfoNoteProps) {
  const box = cn('rounded-lg border px-3 text-xs text-muted-foreground', VARIANTS[variant])

  if (title) {
    return (
      <div role={role} className={cn(box, 'flex flex-col gap-2 py-3')}>
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="size-4 shrink-0" aria-hidden /> {title}
        </p>
        {children}
      </div>
    )
  }
  return (
    <div role={role} className={cn(box, 'flex gap-2.5 py-2.5')}>
      <Icon className="mt-px size-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  )
}
