import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
  server: { port: 5173, host: true },
  // React 19 + Router + zod passam de 500 kB sem minificar; ~225 kB com gzip é o esperado
  build: { chunkSizeWarningLimit: 800 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/components/ui/**', // gerado pelo shadcn
        'src/main.tsx',
        'src/routes/router.tsx', // só declaração de rotas
        'src/test/**',
        '**/*.test.{ts,tsx}',
      ],
      thresholds: { lines: 60, statements: 60, functions: 60, branches: 60 },
    },
  },
})
