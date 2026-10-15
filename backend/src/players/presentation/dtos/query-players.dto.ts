import { BadRequestException } from '@nestjs/common';
import {
  containsControlChars,
  charCount,
  normalizeSpaces,
} from '../../../common/utils/text.js';
import { MAX_ID, POSITIVE_INT_REGEX } from '../../../common/utils/id.js';
import { FindPlayersInput } from '../../application/usecases/find-players/find-players.input.js';
import { POSITIONS } from './create-player.dto.js';
import { CONDITIONS } from './update-condition.dto.js';

const POS_SET = new Set<string>(POSITIONS);
const COND_SET = new Set<string>(CONDITIONS);
const SORT_FIELDS = new Set([
  'name',
  'value_asc',
  'value_desc',
  'age_asc',
  'age_desc',
  'position',
]);

const DECIMAL_REGEX = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

/**
 * Validador e parser dos parâmetros de consulta (Query Params) da rota GET /api/v1/players.
 *
 * Cumpre as regras da Seção 1 do enunciado:
 * - Parâmetros ausentes usam valores padrão.
 * - Parâmetros vazios são recusados com 400.
 * - Inteiros devem ser positivos sem zeros à esquerda.
 * - Decimais com até 2 casas.
 * - Valida contradições (ex: free=true com club_id, min_age > max_age, min_value > max_value).
 * - Ordenação aceita até 2 campos distintos.
 *
 * @param {Record<string, string | undefined>} query - Query params brutos recebidos da requisição HTTP.
 * @returns {FindPlayersInput} Objeto tipado pronto para o caso de uso.
 * @throws {BadRequestException} Se qualquer parâmetro ou combinação for inválida.
 */
export function parseQueryPlayers(
  query: Record<string, string | undefined>,
): FindPlayersInput {
  for (const [key, val] of Object.entries(query)) {
    if (val === '') {
      throw new BadRequestException(`Parâmetro ${key} não pode ser vazio`);
    }
  }

  let search: string | undefined;
  if (query.search !== undefined) {
    const normalized = normalizeSpaces(query.search);
    if (
      containsControlChars(query.search) ||
      charCount(normalized) < 2 ||
      charCount(normalized) > 100
    ) {
      throw new BadRequestException(
        'search deve ter entre 2 e 100 caracteres e sem caracteres de controle',
      );
    }
    search = normalized;
  }

  let position: (typeof POSITIONS)[number] | undefined;
  if (query.position !== undefined) {
    if (!POS_SET.has(query.position)) {
      throw new BadRequestException('Posição inválida no filtro');
    }
    position = query.position as (typeof POSITIONS)[number];
  }

  let condition: (typeof CONDITIONS)[number] | undefined;
  if (query.condition !== undefined) {
    if (!COND_SET.has(query.condition)) {
      throw new BadRequestException('Condição inválida no filtro');
    }
    condition = query.condition as (typeof CONDITIONS)[number];
  }

  let free: boolean | undefined;
  if (query.free !== undefined) {
    if (query.free === 'true') {
      free = true;
    } else if (query.free === 'false') {
      free = false;
    } else {
      throw new BadRequestException('free deve ser true ou false');
    }
  }

  let club_id: number | undefined;
  if (query.club_id !== undefined) {
    if (!POSITIVE_INT_REGEX.test(query.club_id)) {
      throw new BadRequestException('club_id deve ser um inteiro positivo');
    }
    const parsed = Number(query.club_id);
    if (parsed > MAX_ID) {
      throw new BadRequestException('club_id excede o limite');
    }
    club_id = parsed;
  }

  if (free === true && club_id !== undefined) {
    throw new BadRequestException(
      'free=true não pode ser combinado com club_id',
    );
  }

  let min_age: number | undefined;
  if (query.min_age !== undefined) {
    if (!POSITIVE_INT_REGEX.test(query.min_age)) {
      throw new BadRequestException('min_age deve ser um inteiro positivo');
    }
    min_age = Number(query.min_age);
    if (min_age < 16 || min_age > 45) {
      throw new BadRequestException('min_age deve estar entre 16 e 45');
    }
  }

  let max_age: number | undefined;
  if (query.max_age !== undefined) {
    if (!POSITIVE_INT_REGEX.test(query.max_age)) {
      throw new BadRequestException('max_age deve ser um inteiro positivo');
    }
    max_age = Number(query.max_age);
    if (max_age < 16 || max_age > 45) {
      throw new BadRequestException('max_age deve estar entre 16 e 45');
    }
  }

  if (min_age !== undefined && max_age !== undefined && min_age > max_age) {
    throw new BadRequestException('min_age não pode ser maior que max_age');
  }

  let min_value: number | undefined;
  if (query.min_value !== undefined) {
    if (!DECIMAL_REGEX.test(query.min_value)) {
      throw new BadRequestException(
        'min_value deve ser um número decimal válido com até 2 casas',
      );
    }
    min_value = Number(query.min_value);
    if (min_value < 0 || min_value > 550) {
      throw new BadRequestException('min_value deve estar entre 0 e 550');
    }
  }

  let max_value: number | undefined;
  if (query.max_value !== undefined) {
    if (!DECIMAL_REGEX.test(query.max_value)) {
      throw new BadRequestException(
        'max_value deve ser um número decimal válido com até 2 casas',
      );
    }
    max_value = Number(query.max_value);
    if (max_value < 0 || max_value > 550) {
      throw new BadRequestException('max_value deve estar entre 0 e 550');
    }
  }

  if (
    min_value !== undefined &&
    max_value !== undefined &&
    min_value > max_value
  ) {
    throw new BadRequestException('min_value não pode ser maior que max_value');
  }

  let sortList = ['name'];
  if (query.sort !== undefined) {
    const parts = query.sort.split(',');
    if (parts.length > 2) {
      throw new BadRequestException('sort aceita no máximo 2 critérios');
    }
    const fieldsSeen = new Set<string>();
    for (const part of parts) {
      if (!SORT_FIELDS.has(part)) {
        throw new BadRequestException(
          `Critério de ordenação inválido: ${part}`,
        );
      }
      const baseField = part.replace(/_(asc|desc)$/, '');
      if (fieldsSeen.has(baseField)) {
        throw new BadRequestException(
          'Não é permitido repetir o mesmo campo na ordenação',
        );
      }
      fieldsSeen.add(baseField);
    }
    sortList = parts;
  }

  let page = 1;
  if (query.page !== undefined) {
    if (!POSITIVE_INT_REGEX.test(query.page)) {
      throw new BadRequestException('page deve ser um inteiro positivo');
    }
    page = Number(query.page);
  }

  let limit = 10;
  if (query.limit !== undefined) {
    if (!POSITIVE_INT_REGEX.test(query.limit)) {
      throw new BadRequestException('limit deve ser um inteiro positivo');
    }
    limit = Number(query.limit);
    if (limit < 1 || limit > 50) {
      throw new BadRequestException('limit deve estar entre 1 e 50');
    }
  }

  return {
    search,
    position,
    condition,
    free,
    club_id,
    min_age,
    max_age,
    min_value,
    max_value,
    sort: sortList,
    page,
    limit,
  };
}
