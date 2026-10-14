import { CircleAlert } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { FormFieldProps } from './form-field.types'

/** Rótulo + controle + dica, que vira a mensagem de erro quando o campo é recusado */
export function FormField({ id, label, hint, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id} className="font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-message`} className="flex gap-1.5 text-xs text-destructive">
          <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-message`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
