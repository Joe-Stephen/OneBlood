import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '@shared/errors';

export const validate = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body:   req.body,
      query:  req.query,
      params: req.params,
    });
    if (!result.success) {
      return next(new ValidationError(result.error.issues));
    }
    req.validated = result.data;
    next();
  };
