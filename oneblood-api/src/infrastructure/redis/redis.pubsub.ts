import Redis from 'ioredis';
import { redisConfig } from '@config';

// Redis pub/sub requires separate connections
export class RedisPubSub {
  readonly publisher: Redis;
  readonly subscriber: Redis;

  constructor() {
    if (redisConfig.REDIS_URL) {
      // Upstash / managed Redis — URL already contains TLS (rediss://)
      const tlsOpts = { lazyConnect: true, tls: {} };
      this.publisher  = new Redis(redisConfig.REDIS_URL, tlsOpts);
      this.subscriber = new Redis(redisConfig.REDIS_URL, tlsOpts);
    } else {
      // Local development — use individual vars (no TLS)
      const opts = {
        host:        redisConfig.REDIS_HOST,
        port:        redisConfig.REDIS_PORT,
        password:    redisConfig.REDIS_PASSWORD,
        lazyConnect: true,
      };
      this.publisher  = new Redis(opts);
      this.subscriber = new Redis(opts);
    }
  }

  async publish(channel: string, message: unknown): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  subscribe(channel: string, handler: (message: unknown) => void): void {
    this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        try {
          handler(JSON.parse(msg));
        } catch {
          handler(msg);
        }
      }
    });
  }
}
