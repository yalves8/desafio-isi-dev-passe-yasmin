import type { ClubSort } from '@/api/types'
import { enumCodec } from '@/lib/search-params'
import { CLUB_SORT_OPTIONS } from '../../clubs.constants'

/** Ordenação da URL (?sort=); valor inválido volta para o padrão (nome), que não vai para a URL */
export const clubSortCodec = enumCodec<ClubSort>(
  CLUB_SORT_OPTIONS.map((o) => o.value),
  'name',
)
