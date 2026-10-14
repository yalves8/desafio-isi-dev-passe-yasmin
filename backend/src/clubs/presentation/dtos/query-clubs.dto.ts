import { BadRequestException } from '@nestjs/common';
import { ClubSortCriteria } from '../../application/usecases/find-clubs/find-clubs.input.js';
import { ClubSortEnum } from '../../domain/enums/club-sort.enum.js';

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
  for (const [key, val] of Object.entries(query)) {
    if (val === '') {
      throw new BadRequestException(`Parâmetro ${key} não pode ser vazio`);
    }
  }

  if (query.sort === undefined) {
    return { sort: ClubSortEnum.NAME };
  }

  if (
    query.sort === ClubSortEnum.NAME ||
    query.sort === ClubSortEnum.NET_WORTH_ASC ||
    query.sort === ClubSortEnum.NET_WORTH_DESC
  ) {
    return { sort: query.sort as ClubSortCriteria };
  }

  throw new BadRequestException('Critério de ordenação inválido para clubes');
}
