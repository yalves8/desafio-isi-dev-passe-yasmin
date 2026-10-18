import { Link } from 'react-router'
import { Tag } from '@/components/data-display/tag/tag'
import type { ClubTagProps } from './club-tag.types'

export function ClubTag({ club, variant = 'link' }: ClubTagProps) {
  if (!club) return <Tag variant="muted">Livre</Tag>

  const acronym = (
    <Tag variant="muted" className="px-1.5" title={club.name}>
      {club.acronym}
    </Tag>
  )
  if (variant === 'acronym') return acronym

  return (
    <span className="flex items-center gap-2">
      {acronym}
      <Link
        to={`/clubes/${club.id}`}
        className="max-w-36 truncate text-sm underline underline-offset-4 hover:text-primary"
        title={club.name}
      >
        {club.name}
      </Link>
    </span>
  )
}
