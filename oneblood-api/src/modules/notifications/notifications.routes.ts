import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authMiddleware } from '@middleware/auth.middleware';

export function createNotificationsRoutes(controller: NotificationsController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get('/',                   controller.list);
  router.patch('/:id/read',         controller.markRead);
  router.patch('/read-all',         controller.markAllRead);

  return router;
}
