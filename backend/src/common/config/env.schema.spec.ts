import { validateEnv } from './env.schema.js';

const valid = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/app',
  JWT_SECRET: 'x'.repeat(32),
};

describe('validateEnv', () => {
  it('deve aplicar valores padrão', () => {
    expect(validateEnv(valid)).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      JWT_EXPIRES_IN: '1d',
    });
  });

  it('deve converter PORT para número', () => {
    expect(validateEnv({ ...valid, PORT: '8080' }).PORT).toBe(8080);
  });

  it('deve impedir a subida sem JWT_SECRET, informando a variável', () => {
    expect(() => validateEnv({ DATABASE_URL: valid.DATABASE_URL })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('deve exigir JWT_SECRET com ao menos 32 caracteres', () => {
    expect(() => validateEnv({ ...valid, JWT_SECRET: 'curto' })).toThrow(
      'JWT_SECRET deve ter ao menos 32 caracteres',
    );
  });
});
