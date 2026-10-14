import { validateEnv } from './env.schema.js';

const valid = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/app',
};

describe('validateEnv', () => {
  it('deve aplicar valores padrão', () => {
    expect(validateEnv(valid)).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      CORS_ORIGIN: 'http://localhost:5173',
    });
  });

  it('deve converter PORT para número', () => {
    expect(validateEnv({ ...valid, PORT: '8080' }).PORT).toBe(8080);
  });

  it('deve impedir a subida sem DATABASE_URL', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });
});
