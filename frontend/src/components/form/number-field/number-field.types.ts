import type { UseFormRegisterReturn } from 'react-hook-form'
import type { FormFieldProps } from '../form-field/form-field.types'

export interface NumberFieldProps extends Omit<FormFieldProps, 'children'> {
  registration: UseFormRegisterReturn
}
