import { Router } from 'express';
import { RequestsController } from './requests.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import { CreateRequestSchema, UpdateRequestSchema, RespondSchema, ListRequestsSchema } from './requests.schema';

export function createRequestsRoutes(controller: RequestsController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.post('/',         validate(CreateRequestSchema), controller.create);
  router.get('/',          validate(ListRequestsSchema), controller.list);
  router.get('/:id',       controller.getById);
  router.patch('/:id',     validate(UpdateRequestSchema), controller.update);
  router.post('/:id/respond', validate(RespondSchema), controller.respond);

  return router;
}
