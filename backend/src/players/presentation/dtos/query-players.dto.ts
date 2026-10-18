import { BadRequestException } from '@nestjs/common';
import {
  containsControlChars,
  charCount,
  normalizeSpaces,
} from '../../../common/utils/text.js';
import {
  parsePositiveInt,
  parseQueryId,
  rejectEmptyParams,
} from '../../../common/utils/query-params.js';
import { FindPlayersInput } from '../../application/usecases/find-players/find-players.input.js';
import {
  isPlayerSortCriteria,
  PLAYER_SORTS,
  PlayerSortCriteria,
} from '../../domain/player-listing.js';
import { Position, POSITIONS } from '../../../domain/position.js';
import { CONDITIONS } from '../../../domain/condition.js';

const POS_SET = new Set<string>(POSITIONS);
const COND_SET = new Set<string>(CONDITIONS);
/** Filtros 1: min_value e max_value vão de 0 a 550 */
const MAX_VALUE_FILTER = 550;

const DECIMAL_REGEX = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

/**
 * Limite de idade do filtro (`min_age`/`max_age`): inteiro positivo entre 16 e 45.
 *
 * @param {string} name - Nome do parâmetro, usado na mensagem.
 * @param {string | undefined} value - Valor recebido.
 * @returns {number | undefined} A idade, ou undefined se ausente.
 * @throws {BadRequestException} Formato inválido ou fora da faixa.
 */
function parseAgeBound(
  name: 'min_age' | 'max_age',
  value: string | undefined,
): number | undefined {
  if (value === undefined) return undefined;
  const age = parsePositiveInt(name, value);
  if (age < 16 || age > 45) {
    throw new BadRequestException(`${name} deve estar entre 16 e 45`);
  }
  return age;
}

/**
 * Limite de valor do filtro (`min_value`/`max_value`): decimal com até 2 casas entre 0 e 550.
 *
 * @param {string} name - Nome do parâmetro, usado na mensagem.
 * @param {string | undefined} value - Valor recebido.
 * @returns {number | undefined} O valor, ou undefined se ausente.
 * @throws {BadRequestException} Formato inválido ou fora da faixa.
 */
function parseValueBound(
  name: 'min_value' | 'max_value',
  value: string | undefined,
): number | undefined {
  if (value === undefined) return undefined;
  if (!DECIMAL_REGEX.test(value)) {
    throw new BadRequestException(
      `${name} deve ser um número decimal válido com até 2 casas`,
    );
  }
  const parsed = Number(value);
  if (parsed < 0 || parsed > MAX_VALUE_FILTER) {
    throw new BadRequestException(
      `${name} deve estar entre 0 e ${MAX_VALUE_FILTER}`,
    );
  }
  return parsed;
}

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
  rejectEmptyParams(query);

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

  let position: Position | undefined;
  if (query.position !== undefined) {
    if (!POS_SET.has(query.position)) {
      throw new BadRequestException('Posição inválida no filtro');
    }
    position = query.position as Position;
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

  const clubId =
    query.club_id === undefined
      ? undefined
      : parseQueryId('club_id', query.club_id, 'club_id excede o limite');

  if (free === true && clubId !== undefined) {
    throw new BadRequestException(
      'free=true não pode ser combinado com club_id',
    );
  }

  const minAge = parseAgeBound('min_age', query.min_age);
  const maxAge = parseAgeBound('max_age', query.max_age);

  if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
    throw new BadRequestException('min_age não pode ser maior que max_age');
  }

  const minValue = parseValueBound('min_value', query.min_value);
  const maxValue = parseValueBound('max_value', query.max_value);

  if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) {
    throw new BadRequestException('min_value não pode ser maior que max_value');
  }

  let sortList: PlayerSortCriteria[] = ['name'];
  if (query.sort !== undefined) {
    const parts = query.sort.split(',');
    if (parts.length > 2) {
      throw new BadRequestException('sort aceita no máximo 2 critérios');
    }
    const fieldsSeen = new Set<string>();
    sortList = parts.map((part) => {
      if (!isPlayerSortCriteria(part)) {
        throw new BadRequestException(
          `Critério de ordenação inválido: ${part}`,
        );
      }
      const { field } = PLAYER_SORTS[part];
      if (fieldsSeen.has(field)) {
        throw new BadRequestException(
          'Não é permitido repetir o mesmo campo na ordenação',
        );
      }
      fieldsSeen.add(field);
      return part;
    });
  }

  const page =
    query.page === undefined ? 1 : parsePositiveInt('page', query.page);

  const limit =
    query.limit === undefined ? 10 : parsePositiveInt('limit', query.limit);
  if (limit < 1 || limit > 50) {
    throw new BadRequestException('limit deve estar entre 1 e 50');
  }

  return {
    search,
    position,
    condition,
    free,
    clubId,
    minAge,
    maxAge,
    minValue,
    maxValue,
    sort: sortList,
    page,
    limit,
  };
}
