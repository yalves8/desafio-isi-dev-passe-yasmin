import { CircleAlert, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AlertMessageProps } from './alert-message.types'

const VARIANTS = {
  error: {
    icon: CircleAlert,
    role: 'alert',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  warning: {
    icon: TriangleAlert,
    role: 'note',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
} as const

/** Caixa de aviso das telas: título em destaque e a explicação (ex.: o `message` da API) */
export function AlertMessage({ variant, title, children, className }: AlertMessageProps) {
  const { icon: Icon, role, className: tone } = VARIANTS[variant]
  return (
    <div
      role={role}
      className={cn('flex gap-3 rounded-xl border px-4 py-3 text-sm', tone, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        <span className="font-medium">{title}</span>
        <br />
        {children}
      </p>
    </div>
  )
}
