import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/** Cabeçalho de tela (Figma: ícone 48px em azul claro, título 24px e descrição) */
export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {Icon && (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-primary">
            <Icon className="size-5" aria-hidden />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}
