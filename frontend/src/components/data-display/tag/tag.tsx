import { cn } from '@/lib/utils'
import type { TagProps } from './tag.types'
import { tagVariants } from './tag.variants'

export function Tag({ variant, dot, className, children, ...props }: TagProps) {
  return (
    <span className={cn(tagVariants({ variant }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}
