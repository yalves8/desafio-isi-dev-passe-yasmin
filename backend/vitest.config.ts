import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    coverage: {
      // Unitários medem as regras: application/ e common/. Controllers, repositories Prisma
      // e módulos são cobertos pelos testes e2e (test/e2e), que rodam contra o banco no CI.
      include: [
        'src/**/application/**/*.ts',
        'src/**/domain/**/*.ts',
        'src/common/**/*.ts',
      ],
      exclude: ['**/*.spec.ts', 'src/common/prisma/**', 'src/common/**/*.module.ts'],
      thresholds: { lines: 60, statements: 60, functions: 60, branches: 60 },
    },
  },
});
