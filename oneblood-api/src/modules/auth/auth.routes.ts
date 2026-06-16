import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import { GoogleAuthSchema, RefreshTokenSchema, SendOtpSchema, VerifyOtpSchema } from './auth.schema';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post('/google',     validate(GoogleAuthSchema), controller.google);
  router.post('/refresh',    validate(RefreshTokenSchema), controller.refresh);
  router.post('/logout',     authMiddleware, controller.logout);
  router.post('/otp/send',   validate(SendOtpSchema), controller.sendOtp);
  router.post('/otp/verify', validate(VerifyOtpSchema), controller.verifyOtp);

  return router;
}
