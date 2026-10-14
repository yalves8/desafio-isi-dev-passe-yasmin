import { Shirt, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router'
import { Tag } from '@/components/data-display/tag/tag'
import { Button } from '@/components/ui/button'
import { MAX_SQUAD } from '../../clubs.constants'
import { ClubBadge } from '../club-badge/club-badge'
import type { ClubHeaderProps } from './club-header.types'

/** Nome, sigla e lotação do elenco; "Comprar jogadores" leva aos jogadores livres */
export function ClubHeader({ club, squadSize }: ClubHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <ClubBadge acronym={club.acronym} size="lg" />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{club.name}</h1>
          <div className="flex flex-wrap gap-1.5">
            <Tag>Sigla {club.acronym}</Tag>
            <Tag>
              <Shirt className="size-3.5" aria-hidden />
              {squadSize} de {MAX_SQUAD} jogadores
            </Tag>
          </div>
        </div>
      </div>
      <Button size="md" asChild>
        <Link to="/jogadores?tab=free">
          <ShoppingCart /> Comprar jogadores
        </Link>
      </Button>
    </div>
  )
}
