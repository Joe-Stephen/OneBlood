import { z } from 'zod';

// Supabase (and most managed DBs) provide a single DATABASE_URL.
// Individual DB_* vars are kept as fallback for local development.
const schema = z.object({
  DATABASE_URL:  z.string().optional(),          // e.g. Supabase session-pooler URL
  DB_HOST:       z.string().default('localhost'),
  DB_PORT:       z.coerce.number().default(5432),
  DB_NAME:       z.string().default('oneblood'),
  DB_USER:       z.string().default('oneblood_app'),
  DB_PASSWORD:   z.string().default('oneblood_password'),
  DB_POOL_MIN:   z.coerce.number().default(2),
  DB_POOL_MAX:   z.coerce.number().default(10),
});

export const dbConfig = schema.parse(process.env);
