import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BackLinkProps } from './back-link.types'

/** Link "Voltar para …" das telas de detalhe, com a seta à esquerda */
export function BackLink({ to, label, variant = 'outline', className }: BackLinkProps) {
  return (
    <Button
      variant={variant}
      size="md"
      className={cn(variant === 'ghost' && 'px-3', className)}
      asChild
    >
      <Link to={to}>
        <ArrowLeft /> {label}
      </Link>
    </Button>
  )
}
