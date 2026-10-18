import { BadRequestException } from '@nestjs/common';
import { rejectEmptyParams } from '../../../common/utils/query-params.js';
import {
  ClubSortCriteria,
  DEFAULT_CLUB_SORT,
  isClubSortCriteria,
} from '../../domain/club-sort.js';

/**
 * Validador e parser dos parâmetros de consulta (Query Params) da rota GET /api/v1/clubs.
 *
 * @param {Record<string, string | undefined>} query - Objeto com os query params recebidos.
 * @returns {{ sort: ClubSortCriteria }} Objeto contendo o critério de ordenação tipado.
 * @throws {BadRequestException} Se o parâmetro for vazio ou tiver critério não suportado.
 */
export function parseQueryClubs(query: Record<string, string | undefined>): {
  sort: ClubSortCriteria;
} {
  rejectEmptyParams(query);

  if (query.sort === undefined) {
    return { sort: DEFAULT_CLUB_SORT };
  }

  if (isClubSortCriteria(query.sort)) {
    return { sort: query.sort };
  }

  throw new BadRequestException('Critério de ordenação inválido para clubes');
}
