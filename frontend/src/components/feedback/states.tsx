import { Inbox, RefreshCw, ServerOff, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Estados de vazio e de erro de toda tela, conforme o Figma (E02 a E06): ícone num quadrado,
 * título, explicação e uma ação. O carregando fica com o esqueleto de cada tela.
 */

interface StatePanelProps {
  icon: LucideIcon
  title: string
  description?: ReactNode
  action?: ReactNode
  /** Com borda e fundo de card, para usar fora de um card */
  bordered?: boolean
  role?: 'alert' | 'status'
}

/** Painel central de estado: ícone, título, explicação e ação (Figma E02 a E06) */
function StatePanel({
  icon: Icon,
  title,
  description,
  action,
  bordered = false,
  role,
}: StatePanelProps) {
  return (
    <div
      role={role}
      className={cn(
        'flex flex-col items-center gap-2 px-6 py-12 text-center',
        bordered && 'rounded-xl border bg-card shadow-2xs',
      )}
    >
      <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="size-5 text-muted-foreground" aria-hidden />
      </span>
      <p className="text-base font-semibold">{title}</p>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/**
 * Falha ao carregar: o título diz o que não carregou e a descrição traz o `message` da API
 * (ou o aviso de conexão). "Tentar de novo" busca outra vez.
 */
export function ErrorState({
  title = 'Não foi possível carregar os dados',
  message,
  onRetry,
  bordered = false,
}: {
  title?: string
  message: string
  onRetry?: () => void
  bordered?: boolean
}) {
  return (
    <StatePanel
      role="alert"
      icon={ServerOff}
      title={title}
      description={message}
      bordered={bordered}
      action={
        onRetry && (
          <Button variant="outline" size="md" onClick={onRetry}>
            <RefreshCw /> Tentar de novo
          </Button>
        )
      }
    />
  )
}

export function EmptyState({
  icon = Inbox,
  title,
  description,
  action,
  bordered = false,
}: {
  icon?: LucideIcon
  title: string
  description?: ReactNode
  action?: ReactNode
  bordered?: boolean
}) {
  return (
    <StatePanel
      icon={icon}
      title={title}
      description={description}
      action={action}
      bordered={bordered}
    />
  )
}
