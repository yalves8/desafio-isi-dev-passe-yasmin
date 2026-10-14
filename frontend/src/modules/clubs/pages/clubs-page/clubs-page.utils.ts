import type { ClubSort } from '@/api/types'
import { CLUB_SORT_OPTIONS } from '../../clubs.constants'

/** Ordenação da URL; valor inválido volta para o padrão (nome) */
export function parseClubSort(value: string | null): ClubSort {
  return CLUB_SORT_OPTIONS.some((o) => o.value === value) ? (value as ClubSort) : 'name'
}
