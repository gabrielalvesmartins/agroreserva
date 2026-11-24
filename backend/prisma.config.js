import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'node prisma/seed.js' },
  // process.env (e não env()) para que "prisma generate" funcione sem banco configurado
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
