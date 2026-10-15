import { BadRequestException } from '@nestjs/common';
import { parseTransactionFilters } from '../presentation/dtos/transaction-filters.dto.js';

describe('parseTransactionFilters', () => {
  it('deve aceitar a ausência de filtros e ignorar parâmetros desconhecidos', () => {
    expect(parseTransactionFilters({ page: '2' })).toEqual({
      types: undefined,
      playerId: undefined,
    });
  });

  it('deve aceitar um ou mais tipos separados por vírgula e o player_id', () => {
    expect(parseTransactionFilters({ type: 'VENDA', player_id: '2' })).toEqual({
      types: ['VENDA'],
      playerId: 2,
    });
    expect(parseTransactionFilters({ type: 'COMPRA,VENDA' }).types).toEqual([
      'COMPRA',
      'VENDA',
    ]);
  });

  it.each([
    [{ type: '' }],
    [{ player_id: '' }],
    [{ type: 'venda' }],
    [{ type: 'COMPRA,venda' }],
    [{ type: 'COMPRA, VENDA' }],
    [{ type: 'VENDA,VENDA' }],
    [{ type: 'COMPRA,' }],
    [{ type: 'TROCA' }],
    [{ player_id: '0' }],
    [{ player_id: '-1' }],
    [{ player_id: '01' }],
    [{ player_id: '1.0' }],
    [{ player_id: '1e2' }],
    [{ player_id: 'abc' }],
    [{ player_id: '2147483648' }],
  ])('deve recusar %j com 400', (query) => {
    expect(() => parseTransactionFilters(query)).toThrow(BadRequestException);
  });
});
