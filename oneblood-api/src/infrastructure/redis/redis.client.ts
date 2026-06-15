import Redis from 'ioredis';
import { redisConfig } from '@config';

let instance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!instance) {
    instance = new Redis({
      host:     redisConfig.REDIS_HOST,
      port:     redisConfig.REDIS_PORT,
      password: redisConfig.REDIS_PASSWORD,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });

    instance.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }
  return instance;
}

export { Redis };
