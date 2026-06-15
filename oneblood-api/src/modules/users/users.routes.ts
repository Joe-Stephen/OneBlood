import { Router } from 'express';
import { UsersController } from './users.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import { UpdateUserSchema } from './users.schema';

export function createUsersRoutes(controller: UsersController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get('/',    controller.getMe);
  router.patch('/',  validate(UpdateUserSchema), controller.updateMe);
  router.delete('/', controller.deleteMe);

  return router;
}
