import { cva } from 'class-variance-authority'

/** Etiqueta de 24px do Figma: posição, condição, "Livre", sigla do clube */
export const tagVariants = cva(
  'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        outline: 'border bg-card',
        muted: 'bg-muted',
        success: 'border border-green-200 bg-green-50 text-green-800',
        warning: 'border border-amber-200 bg-amber-50 text-amber-800',
        danger: 'border border-red-200 bg-red-50 text-red-700',
      },
    },
    defaultVariants: { variant: 'outline' },
  },
)
