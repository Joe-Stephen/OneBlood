import { z } from 'zod';

// Upstash Redis (and most managed Redis) provide a single REDIS_URL (TLS).
// Individual REDIS_* vars are kept as fallback for local development.
const schema = z.object({
  REDIS_URL:      z.string().optional(),         // e.g. rediss://:<password>@<host>:<port> (Upstash)
  REDIS_HOST:     z.string().default('localhost'),
  REDIS_PORT:     z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
});

export const redisConfig = schema.parse(process.env);
