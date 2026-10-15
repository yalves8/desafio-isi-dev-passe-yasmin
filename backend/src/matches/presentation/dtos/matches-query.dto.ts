import { BadRequestException } from '@nestjs/common';

const MAX_ID = 2_147_483_647;
const ID_REGEX = /^[1-9]\d*$/;

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
  if (
    typeof value !== 'string' ||
    !ID_REGEX.test(value) ||
    Number(value) > MAX_ID
  ) {
    throw new BadRequestException('club_id deve ser um inteiro positivo');
  }
  return { clubId: Number(value) };
}
