import 'dotenv/config';
import { createApp } from './app';
import { appConfig } from '@config';
import { db } from './container/ioc.container';

const app = createApp();
const server = app.listen(appConfig.PORT, () => {
  console.log(`🩸 OneBlood API running on port ${appConfig.PORT} [${appConfig.NODE_ENV}]`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    await db.end();
    console.log('Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
