import { BadRequestException } from '@nestjs/common';
import { TransactionType } from '../../application/interfaces/repositories/transfer.repository.interface.js';
import { parseQueryId } from '../../../common/utils/query-params.js';

const TYPES: readonly TransactionType[] = ['COMPRA', 'VENDA'];

/**
 * Valida os filtros do histórico e da exportação (GET /clubs/{id}/transactions[/export]).
 *
 * - `type`: um ou mais de `COMPRA` e `VENDA`, separados por vírgula, sem espaços e sem repetição.
 * - `player_id`: inteiro positivo só com dígitos, sem zeros à esquerda, até 2.147.483.647.
 * - Parâmetro presente com valor vazio → 400; parâmetro fora da lista é ignorado.
 *
 * @param {Record<string, unknown>} query - Query params recebidos.
 * @returns {{ types?: TransactionType[]; playerId?: number }} Filtros tipados.
 * @throws {BadRequestException} Filtro inválido.
 */
export function parseTransactionFilters(query: Record<string, unknown>): {
  types?: TransactionType[];
  playerId?: number;
} {
  const { type, player_id: playerId } = query;
  for (const [name, value] of [
    ['type', type],
    ['player_id', playerId],
  ] as const) {
    if (value !== undefined && typeof value !== 'string') {
      throw new BadRequestException(`Parâmetro ${name} inválido`);
    }
    if (value === '') {
      throw new BadRequestException(`Parâmetro ${name} não pode ser vazio`);
    }
  }

  let types: TransactionType[] | undefined;
  if (typeof type === 'string') {
    const parts = type.split(',');
    const valid = parts.every((part) =>
      TYPES.includes(part as TransactionType),
    );
    if (!valid || new Set(parts).size !== parts.length) {
      throw new BadRequestException(
        'type aceita COMPRA e VENDA, separados por vírgula e sem repetição',
      );
    }
    types = parts as TransactionType[];
  }

  const id =
    typeof playerId === 'string'
      ? parseQueryId('player_id', playerId)
      : undefined;

  return { types, playerId: id };
}
