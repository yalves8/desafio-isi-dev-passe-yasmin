import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // process.env em vez de env(): o `prisma generate` (postinstall/Docker build) roda sem DATABASE_URL
    url: process.env.DATABASE_URL,
  },
});
