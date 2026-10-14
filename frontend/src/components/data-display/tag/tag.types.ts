import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import type { tagVariants } from './tag.variants'

export interface TagProps extends ComponentProps<'span'>, VariantProps<typeof tagVariants> {
  /** Bolinha colorida antes do texto (condição física) */
  dot?: boolean
}
