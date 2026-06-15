import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import { GoogleAuthSchema, RefreshTokenSchema } from './auth.schema';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post('/google',  validate(GoogleAuthSchema), controller.google);
  router.post('/refresh', validate(RefreshTokenSchema), controller.refresh);
  router.post('/logout',  authMiddleware, controller.logout);

  return router;
}
