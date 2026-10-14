import { Tag } from '@/components/data-display/tag/tag'
import { POSITION_LABEL } from '../../players.constants'
import type { PositionBadgeProps } from './position-badge.types'

export function PositionBadge({ position }: PositionBadgeProps) {
  return (
    <Tag variant="outline" title={POSITION_LABEL[position]}>
      {position}
    </Tag>
  )
}
