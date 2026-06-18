import Redis from 'ioredis';
import { redisConfig } from '@config';

let instance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!instance) {
    if (redisConfig.REDIS_URL) {
      // Upstash / managed Redis — URL already contains TLS (rediss://)
      instance = new Redis(redisConfig.REDIS_URL, {
        lazyConnect:   true,
        retryStrategy: (times) => Math.min(times * 100, 3000),
        tls:           {}, // Enable TLS for rediss:// URLs
      });
    } else {
      // Local development — use individual vars (no TLS)
      instance = new Redis({
        host:          redisConfig.REDIS_HOST,
        port:          redisConfig.REDIS_PORT,
        password:      redisConfig.REDIS_PASSWORD,
        lazyConnect:   true,
        retryStrategy: (times) => Math.min(times * 100, 3000),
      });
    }

    instance.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }
  return instance;
}

export { Redis };
