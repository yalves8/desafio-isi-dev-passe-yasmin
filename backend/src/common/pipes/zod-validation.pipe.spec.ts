import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    name: z.string(),
    age: z.number().int(),
  });
  const pipe = new ZodValidationPipe(schema);

  it('deve rejeitar corpo que não é objeto (V1)', () => {
    expect(() => pipe.transform('texto', { type: 'body' })).toThrow(
      BadRequestException,
    );

    expect(() => pipe.transform([1, 2, 3], { type: 'body' })).toThrow(
      BadRequestException,
    );

    expect(() => pipe.transform(123, { type: 'body' })).toThrow(
      BadRequestException,
    );

    expect(() => pipe.transform(null, { type: 'body' })).toThrow(
      BadRequestException,
    );
  });

  it('deve validar e ignorar campos extras (V7)', () => {
    const input = {
      name: 'Teste',
      age: 20,
      extra_field: 'ignorado',
      id: 999,
    };
    const result = pipe.transform(input, { type: 'body' });
    expect(result).toEqual({
      name: 'Teste',
      age: 20,
    });
  });

  it('deve lançar BadRequestException quando faltar campo obrigatório (V6)', () => {
    expect(() => pipe.transform({ name: 'Teste' }, { type: 'body' })).toThrow(
      BadRequestException,
    );
  });
});
