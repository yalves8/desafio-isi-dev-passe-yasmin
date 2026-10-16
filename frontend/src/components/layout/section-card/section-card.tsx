import { useId } from 'react'
import { cn } from '@/lib/utils'
import type { SectionCardProps } from './section-card.types'

/** Cartão de seção das telas: título (que dá nome à região), descrição, ações e conteúdo */
export function SectionCard({
  title,
  description,
  actions,
  headingLevel = 2,
  shadow = true,
  className,
  headerClassName,
  children,
}: SectionCardProps) {
  const titleId = useId()
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <section
      aria-labelledby={titleId}
      className={cn('overflow-hidden rounded-xl border bg-card', shadow && 'shadow-2xs', className)}
    >
      <header
        className={cn(
          'flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4',
          headerClassName,
        )}
      >
        <div>
          <Heading id={titleId} className="text-base font-semibold">
            {title}
          </Heading>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}
