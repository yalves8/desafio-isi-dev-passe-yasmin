import { BadRequestException } from '@nestjs/common';
import { AppExpressAdapter } from './app-express.adapter.js';

describe('AppExpressAdapter', () => {
  const adapter = new AppExpressAdapter();

  it('deve trocar o erro do parser de JSON por uma mensagem amigável', () => {
    let parserError: unknown;
    try {
      JSON.parse('{"name": "x",');
    } catch (error) {
      parserError = error;
    }

    const mapped = adapter.mapException(parserError);

    expect(mapped).toBeInstanceOf(BadRequestException);
    expect((mapped as BadRequestException).message).toBe(
      'O corpo da requisição não é um JSON válido',
    );
  });

  it('deve manter os demais erros como estão', () => {
    const error = new Error('outro erro');
    expect(adapter.mapException(error)).toBe(error);
  });
});
