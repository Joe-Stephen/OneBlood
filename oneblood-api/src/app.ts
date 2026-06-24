import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';
import { appConfig } from '@config';
import { errorMiddleware } from '@middleware/error.middleware';
import { routes } from './container/ioc.container';

export function createApp() {
  const app = express();

  // Parse CORS_ORIGIN — supports comma-separated list of origins
  const corsOrigins = appConfig.CORS_ORIGIN.split(',').map(o => o.trim());
  const corsOrigin = corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins;

  // Security
  app.use(helmet());
  app.use(cors({
    origin:      corsOrigin,
    credentials: true,
    methods:     ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }));

  // Parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());
  app.use(compression());

  // Logging (skip in test)
  if (appConfig.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Health
  app.get('/health', (_req, res) =>
    res.json({ status: 'ok', timestamp: new Date().toISOString() }),
  );

  // Routes
  app.use('/v1/auth',          routes.auth);
  app.use('/v1/users/me',      routes.users);
  app.use('/v1/donors',        routes.donors);
  app.use('/v1/requests',      routes.requests);
  app.use('/v1/donations',     routes.donations);
  app.use('/v1/notifications', routes.notifications);
  app.use('/v1/admin',         routes.admin);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  // Global error handler (must be last)
  app.use(errorMiddleware);

  return app;
}
