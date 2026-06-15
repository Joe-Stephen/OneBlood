import { z } from 'zod';

const schema = z.object({
  REDIS_HOST:     z.string().default('localhost'),
  REDIS_PORT:     z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
});

export const redisConfig = schema.parse(process.env);
