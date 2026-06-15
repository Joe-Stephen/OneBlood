import { z } from 'zod';

const schema = z.object({
  DB_HOST:     z.string().default('localhost'),
  DB_PORT:     z.coerce.number().default(5432),
  DB_NAME:     z.string().default('oneblood'),
  DB_USER:     z.string().default('oneblood_app'),
  DB_PASSWORD: z.string().default('oneblood_password'),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_MAX: z.coerce.number().default(10),
});

export const dbConfig = schema.parse(process.env);
