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

  describe('mensagem de tipo', () => {
    const typed = new ZodValidationPipe(
      z.object({
        name: z.string({ error: 'name é obrigatório' }),
        age: z.number({ error: 'age é obrigatório' }).int(),
        club_id: z
          .number({ error: 'club_id é obrigatório e deve ser um inteiro' })
          .optional(),
        ids: z
          .array(z.number({ error: 'ids deve ter só inteiros positivos' }))
          .optional(),
      }),
    );
    const messageOf = (value: unknown) => {
      try {
        typed.transform(value, { type: 'body' });
      } catch (error) {
        return (error as BadRequestException).message;
      }
      return undefined;
    };

    it.each([
      [{ name: 'Teste' }, 'age é obrigatório'],
      [{ name: 'Teste', age: null }, 'age é obrigatório'],
      [{ name: 'Teste', age: '30' }, 'age deve ser um número'],
      [{ name: 'Teste', age: true }, 'age deve ser um número'],
      [{ name: 123, age: 30 }, 'name deve ser um texto'],
    ])('deve explicar o tipo errado em %j', (value, message) => {
      expect(messageOf(value)).toBe(message);
    });

    it.each([
      [
        { name: 'Teste', age: 30, club_id: '1' },
        'club_id é obrigatório e deve ser um inteiro',
      ],
      [
        { name: 'Teste', age: 30, ids: ['a'] },
        'ids deve ter só inteiros positivos',
      ],
    ])(
      'deve manter a mensagem de tipo específica do schema em %j',
      (value, message) => {
        expect(messageOf(value)).toBe(message);
      },
    );
  });
});
