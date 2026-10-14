import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { InputWithIconProps } from './input-with-icon.types'

/** Input com ícone à esquerda (busca, nome do jogador) */
export function InputWithIcon({
  icon: Icon,
  containerClassName,
  className,
  ...props
}: InputWithIconProps) {
  return (
    <div className={cn('relative', containerClassName)}>
      <Icon
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input className={cn('h-9 pl-9', className)} {...props} />
    </div>
  )
}
