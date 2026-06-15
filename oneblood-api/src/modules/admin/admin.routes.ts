import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/role.middleware';

export function createAdminRoutes(controller: AdminController): Router {
  const router = Router();
  router.use(authMiddleware, requireRole('ADMIN'));

  router.get('/dashboard',           controller.getDashboard);
  router.get('/users',               controller.listUsers);
  router.patch('/users/:id',         controller.updateUser);
  router.get('/hospitals',           controller.listHospitals);
  router.post('/hospitals',          controller.createHospital);
  router.patch('/hospitals/:id/verify', controller.verifyHospital);
  router.get('/audit-logs',          controller.getAuditLogs);

  return router;
}
