import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@shared/errors';

export type UserRole = 'DONOR' | 'REQUESTER' | 'ADMIN';

export const requireRole = (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      return next(new ForbiddenError(`Requires role: ${roles.join(' or ')}`));
    }
    next();
  };
