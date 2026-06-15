import { Router } from 'express';
import { DonationsController } from './donations.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import { LogDonationSchema } from './donations.schema';

export function createDonationsRoutes(controller: DonationsController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.post('/',    validate(LogDonationSchema), controller.log);
  router.get('/',     controller.list);
  router.get('/:id',  controller.getById);

  return router;
}
