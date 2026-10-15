import { CircleAlert } from 'lucide-react'
import type { FieldMessageProps } from './field-message.types'

/** Dica do campo, que vira a mensagem de erro (em vermelho) quando o campo é recusado */
export function FieldMessage({ id, hint, error }: FieldMessageProps) {
  if (error) {
    return (
      <p id={`${id}-message`} className="flex gap-1.5 text-xs text-destructive">
        <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
        {error}
      </p>
    )
  }
  if (!hint) return null
  return (
    <p id={`${id}-message`} className="text-xs text-muted-foreground">
      {hint}
    </p>
  )
}
