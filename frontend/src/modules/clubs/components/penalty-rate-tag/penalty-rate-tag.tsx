import { Check } from 'lucide-react'
import { Tag } from '@/components/data-display/tag/tag'
import type { PenaltyRateTagProps } from './penalty-rate-tag.types'

/** 0% em verde (fidelidade cumprida), 5% e 10% em âmbar, 20% em vermelho */
export function PenaltyRateTag({ rate }: PenaltyRateTagProps) {
  if (rate === 0) {
    return (
      <Tag variant="success">
        <Check className="size-3" aria-hidden />
        0%
      </Tag>
    )
  }
  return <Tag variant={rate >= 20 ? 'danger' : 'warning'}>{rate}%</Tag>
}
