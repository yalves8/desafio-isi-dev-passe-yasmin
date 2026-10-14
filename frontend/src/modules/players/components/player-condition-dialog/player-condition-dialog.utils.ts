import type { Condition } from '@/api/types'

/** De DOENTE não se vai direto para APTO (a API recusa com 409) */
export function isConditionBlocked(current: Condition, next: Condition) {
  return current === 'DOENTE' && next === 'APTO'
}
