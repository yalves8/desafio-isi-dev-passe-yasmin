import type { PageSkeletonProps } from './page-skeleton.types'

/** Carregando de uma tela inteira: os esqueletos da tela, anunciados como status */
export function PageSkeleton({ label, children }: PageSkeletonProps) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-6">
      {children}
    </div>
  )
}
