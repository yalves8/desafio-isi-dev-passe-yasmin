import type { Condition } from '@/api/types'
import { canChangeCondition } from '../../players.constants'

/** De DOENTE não se vai direto para APTO (a API recusa com 409) */
export function isConditionBlocked(current: Condition, next: Condition) {
  return !canChangeCondition(current, next)
}
