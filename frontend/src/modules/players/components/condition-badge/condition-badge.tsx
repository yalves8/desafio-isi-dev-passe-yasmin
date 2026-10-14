import { Tag } from '@/components/data-display/tag/tag'
import { CONDITION_BY_VALUE } from '../../players.constants'
import type { ConditionBadgeProps } from './condition-badge.types'

export function ConditionBadge({ condition }: ConditionBadgeProps) {
  const { label, tone } = CONDITION_BY_VALUE[condition]
  return (
    <Tag variant={tone} dot>
      {label}
    </Tag>
  )
}
