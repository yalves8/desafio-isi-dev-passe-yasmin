import { BadRequestException } from '@nestjs/common';
import { parseQueryId } from '../../../common/utils/query-params.js';

/**
 * Valida o filtro de GET /matches: `club_id` inteiro positivo só com dígitos, sem zeros à
 * esquerda; vazio ou em outra forma → 400. Outros parâmetros são ignorados.
 *
 * @param {Record<string, unknown>} query - Query params recebidos.
 * @returns {{ clubId?: number }} Filtro tipado.
 * @throws {BadRequestException} Filtro inválido.
 */
export function parseMatchesQuery(query: Record<string, unknown>): {
  clubId?: number;
} {
  const value = query.club_id;
  if (value === undefined) return {};
  if (value === '') {
    throw new BadRequestException('Parâmetro club_id não pode ser vazio');
  }
  if (typeof value !== 'string') {
    throw new BadRequestException('club_id deve ser um inteiro positivo');
  }
  return { clubId: parseQueryId('club_id', value) };
}
