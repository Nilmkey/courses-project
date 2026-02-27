// api/v1/lessons/lessons.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { ApiError } from '../../../utils/ApiError';

export const validateRequest = <T extends ZodObject>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');
        next(ApiError.badRequest(message));
      } else {
        next(error);
      }
    }
  };
};