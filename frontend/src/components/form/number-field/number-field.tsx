import { Input } from '@/components/ui/input'
import { FormField } from '../form-field/form-field'
import type { NumberFieldProps } from './number-field.types'

/** Campo inteiro: o valor fica como texto no formulário e o schema converte para número */
export function NumberField({ registration, ...field }: NumberFieldProps) {
  return (
    <FormField {...field}>
      <Input
        id={field.id}
        inputMode="numeric"
        autoComplete="off"
        className="h-9"
        aria-invalid={!!field.error}
        aria-describedby={`${field.id}-message`}
        {...registration}
      />
    </FormField>
  )
}
