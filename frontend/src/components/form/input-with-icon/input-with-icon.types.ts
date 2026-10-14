import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

export interface InputWithIconProps extends ComponentProps<'input'> {
  icon: LucideIcon
  /** Classe do contêiner (largura/flex); `className` vai para o input */
  containerClassName?: string
}
