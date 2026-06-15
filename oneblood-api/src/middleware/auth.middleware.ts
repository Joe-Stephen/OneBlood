import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '@config';
import { UnauthorizedError } from '@shared/errors';
import { AuthUser } from '@modules/auth/auth.types';

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.access_token;

    if (!token) throw new UnauthorizedError('No token provided');

    const decoded = jwt.verify(token, appConfig.JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid or expired token'));
    } else {
      next(err);
    }
  }
};
