import { cn } from '@/lib/utils'

/** Marca oficial do sistema Passe */
export function Brand({ className }: { className?: string; inverted?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-heading text-lg font-bold tracking-tight',
        className,
      )}
    >
      <img src="/assets/logo-passe.svg" alt="Passe logo" className="size-7 rounded-lg" />
      <span>Passe</span>
    </span>
  )
}
