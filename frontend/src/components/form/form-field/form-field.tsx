import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { FieldMessage } from '../field-message/field-message'
import type { FormFieldProps } from './form-field.types'

/** Rótulo + controle + dica, que vira a mensagem de erro quando o campo é recusado */
export function FormField({ id, label, hint, error, group, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {group ? (
        <span id={`${id}-label`} className="text-sm font-medium">
          {label}
        </span>
      ) : (
        <Label htmlFor={id} className="font-medium">
          {label}
        </Label>
      )}
      {children}
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  )
}
