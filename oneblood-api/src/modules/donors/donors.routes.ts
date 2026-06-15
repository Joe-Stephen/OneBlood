import { Router } from 'express';
import { DonorsController } from './donors.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/role.middleware';
import { validate } from '@middleware/validate.middleware';
import { CreateDonorProfileSchema, UpdateDonorProfileSchema, NearbyDonorsQuerySchema } from './donors.schema';

export function createDonorsRoutes(controller: DonorsController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.post('/profile',    validate(CreateDonorProfileSchema), controller.createProfile);
  router.get('/profile',     controller.getProfile);
  router.patch('/profile',   validate(UpdateDonorProfileSchema), controller.updateProfile);
  router.get('/eligibility', controller.getEligibility);
  router.get('/nearby',      requireRole('ADMIN'), validate(NearbyDonorsQuerySchema), controller.findNearby);

  return router;
}
