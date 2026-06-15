import 'dotenv/config';
import http from 'http';
import { createApp } from './app';
import { appConfig } from '@config';
import { db } from './container/ioc.container';
import { getRedisClient } from '@infrastructure/redis/redis.client';
import { RedisCache } from '@infrastructure/redis/redis.cache';
import { RedisPubSub } from '@infrastructure/redis/redis.pubsub';
import { createSocketGateway } from '@infrastructure/socket/socket.gateway';

const app = createApp();
const server = http.createServer(app);

// Wire Socket.io gateway
const cache  = new RedisCache();
const pubsub = new RedisPubSub();
createSocketGateway(server, cache, pubsub);

server.listen(appConfig.PORT, () => {
  console.log(`\n🩸 OneBlood API running on port ${appConfig.PORT} [${appConfig.NODE_ENV}]`);
  console.log(`   REST:      http://localhost:${appConfig.PORT}/v1`);
  console.log(`   WebSocket: ws://localhost:${appConfig.PORT}`);
  console.log(`   Health:    http://localhost:${appConfig.PORT}/health\n`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n⏳ Shutting down gracefully...');
  server.close(async () => {
    const redis = getRedisClient();
    await Promise.allSettled([db.end(), redis.quit()]);
    console.log('✅ Server closed.');
    process.exit(0);
  });
  // Force quit if not done in 10s
  setTimeout(() => process.exit(1), 10_000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
  process.exit(1);
});
